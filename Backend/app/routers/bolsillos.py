import json
from decimal import Decimal
from datetime import date, datetime, time, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.redis import redis_pos
from app.core.security import get_current_user
from app.database import get_db
from app.models.bolsillo import Bolsillo
from app.models.bolsilloMovimiento import BolsilloMovimiento
from app.models.cajas import Caja
from app.models.cierre_dia import CierreDia
from app.models.cierre_metodos_pago import CierreMetodoPago
from app.models.categorias import Categoria
from app.models.detalle_venta import DetalleVenta
from app.models.marcas import Marca
from app.models.metodos_pago import MetodoPago
from app.models.pagos_venta import PagoVenta
from app.models.productos import Producto
from app.models.usuarios import Usuario
from app.models.ventas import Venta
from app.schemas.bolsillos import (
    BolsilloCreate,
    BolsilloResponse,
    BolsilloUpdate,
    MovimientoBolsilloCreate,
    MovimientoBolsilloResponse,
    PagoBolsilloCreate,
    CierreDiaCreate,
    CierreDiaResponse,
    CierreDiaRangoResponse,
)
from app.utils.registrar_logs import registrar_log

REDIS_KEY_TOTAL_BOLSILLOS = "cierre:bolsillos:total"
REDIS_KEY_FECHA_CIERRE = "cierre:bolsillos:fecha"
BOLSILLO_META_PREFIX = "__bolsillo_meta__:"

router = APIRouter(
    prefix="/api/bolsillos",
    tags=["Cierre de Dia / Bolsillos"],
)


def _extraer_meta(descripcion: Optional[str]):
    if not descripcion:
        return {"descripcion": None, "color": None, "icono": None}

    if descripcion.startswith(BOLSILLO_META_PREFIX):
        payload = descripcion[len(BOLSILLO_META_PREFIX):]
        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            data = {}

        return {
            "descripcion": data.get("descripcion") or None,
            "color": data.get("color") or None,
            "icono": data.get("icono") or None,
        }

    return {"descripcion": descripcion, "color": None, "icono": None}


def _codificar_meta(descripcion=None, color=None, icono=None):
    payload = {
        "descripcion": descripcion or None,
        "color": color or None,
        "icono": icono or None,
    }

    if any(valor not in (None, "") for valor in payload.values()):
        return BOLSILLO_META_PREFIX + json.dumps(payload, ensure_ascii=False)

    return None


def _serializar_bolsillo(bolsillo):
    meta = _extraer_meta(bolsillo.descripcion)
    return {
        "id_bolsillo": bolsillo.id_bolsillo,
        "nombre": bolsillo.nombre,
        "descripcion": meta["descripcion"],
        "color": meta["color"],
        "icono": meta["icono"],
        "saldo_actual": bolsillo.saldo_actual,
        "activo": bolsillo.activo,
        "fecha_creacion": bolsillo.fecha_creacion,
    }


def _serializar_movimiento(movimiento, nombre_bolsillo: str, nombre_usuario: str):
    return {
        "id_movimiento": movimiento.id_movimiento,
        "id_bolsillo": movimiento.id_bolsillo,
        "nombre_bolsillo": nombre_bolsillo,
        "id_usuario": movimiento.id_usuario,
        "nombre_usuario": nombre_usuario,
        "tipo": movimiento.tipo,
        "monto": movimiento.monto,
        "motivo": movimiento.motivo,
        "fecha": movimiento.fecha,
    }


def _obtener_bolsillo_activo(db: Session, id_bolsillo: int):
    bolsillo = db.query(Bolsillo).filter(
        Bolsillo.id_bolsillo == id_bolsillo,
        Bolsillo.activo.is_(True),
    ).first()
    if not bolsillo:
        raise HTTPException(status_code=404, detail="Bolsillo no encontrado")
    return bolsillo


def _obtener_usuario(db: Session, id_usuario: int):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


def _registrar_movimiento(
    db: Session,
    user: Usuario,
    bolsillo: Bolsillo,
    id_caja: int,
    tipo: str,
    monto: Decimal,
    motivo: Optional[str],
):
    movimiento = BolsilloMovimiento(
        id_bolsillo=bolsillo.id_bolsillo,
        id_caja=id_caja,
        id_usuario=user.id_usuario,
        tipo=tipo,
        monto=monto,
        motivo=motivo,
    )
    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)
    db.refresh(bolsillo)
    return _serializar_movimiento(movimiento, bolsillo.nombre, user.nombre)


@router.post("/", response_model=BolsilloResponse)
def crear_bolsillo(
    data: BolsilloCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    total_redis = Decimal(redis_pos.get(REDIS_KEY_TOTAL_BOLSILLOS) or 0)
    monto_inicial = Decimal(data.saldo_actual or 0)

    if monto_inicial < 0:
        raise HTTPException(status_code=400, detail="Monto inválido")

    if monto_inicial > total_redis:
        raise HTTPException(
            status_code=400,
            detail="El valor asignado supera el total disponible",
        )

    if monto_inicial > 0:
        redis_pos.incrbyfloat(REDIS_KEY_TOTAL_BOLSILLOS, -float(monto_inicial))

    bolsillo = Bolsillo(
        nombre=data.nombre,
        descripcion=_codificar_meta(data.descripcion, data.color, data.icono),
        saldo_actual=monto_inicial,
    )
    db.add(bolsillo)
    db.commit()
    db.refresh(bolsillo)

    registrar_log(db, user.id_usuario, "Crear bolsillo", f"Bolsillo creado: {bolsillo.nombre}")
    return _serializar_bolsillo(bolsillo)


@router.get("/", response_model=List[BolsilloResponse])
def listar_bolsillos(db: Session = Depends(get_db)):
    bolsillos = db.query(Bolsillo).filter(Bolsillo.activo.is_(True)).all()
    return [_serializar_bolsillo(bolsillo) for bolsillo in bolsillos]


@router.put("/{id_bolsillo}", response_model=BolsilloResponse)
def actualizar_bolsillo(
    id_bolsillo: int,
    data: BolsilloUpdate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    bolsillo = _obtener_bolsillo_activo(db, id_bolsillo)
    meta_actual = _extraer_meta(bolsillo.descripcion)

    if data.nombre is not None:
        bolsillo.nombre = data.nombre

    if data.descripcion is not None or data.color is not None or data.icono is not None:
        bolsillo.descripcion = _codificar_meta(
            data.descripcion if data.descripcion is not None else meta_actual["descripcion"],
            data.color if data.color is not None else meta_actual["color"],
            data.icono if data.icono is not None else meta_actual["icono"],
        )

    db.commit()
    db.refresh(bolsillo)

    registrar_log(db, user.id_usuario, "Actualizar bolsillo", f"Bolsillo actualizado: {bolsillo.nombre}")
    return _serializar_bolsillo(bolsillo)


@router.delete("/{id_bolsillo}")
def eliminar_bolsillo(
    id_bolsillo: int,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    bolsillo = _obtener_bolsillo_activo(db, id_bolsillo)

    saldo_retorno = Decimal(bolsillo.saldo_actual or 0)
    if saldo_retorno > 0:
        redis_pos.incrbyfloat(REDIS_KEY_TOTAL_BOLSILLOS, float(saldo_retorno))

    bolsillo.saldo_actual = Decimal("0")
    bolsillo.activo = False
    db.commit()

    registrar_log(db, user.id_usuario, "Eliminar bolsillo", f"Bolsillo eliminado: {bolsillo.nombre}")
    return {"detail": "Bolsillo eliminado correctamente"}


@router.get("/total-disponible")
def total_disponible_bolsillos():
    total = redis_pos.get(REDIS_KEY_TOTAL_BOLSILLOS)
    return {"total": Decimal(total) if total else Decimal("0.00")}


@router.post("/movimiento", response_model=MovimientoBolsilloResponse)
def mover_dinero_bolsillo(
    data: MovimientoBolsilloCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    bolsillo = _obtener_bolsillo_activo(db, data.id_bolsillo)

    if data.monto <= 0:
        raise HTTPException(status_code=400, detail="Monto inválido")

    total_redis = Decimal(redis_pos.get(REDIS_KEY_TOTAL_BOLSILLOS) or 0)

    if data.tipo == "entrada":
        if data.monto > total_redis:
            raise HTTPException(status_code=400, detail="El monto supera el total disponible")
        redis_pos.incrbyfloat(REDIS_KEY_TOTAL_BOLSILLOS, -float(data.monto))
        bolsillo.saldo_actual += data.monto
    elif data.tipo == "salida":
        if data.monto > bolsillo.saldo_actual:
            raise HTTPException(status_code=400, detail="Saldo insuficiente en el bolsillo")
        redis_pos.incrbyfloat(REDIS_KEY_TOTAL_BOLSILLOS, float(data.monto))
        bolsillo.saldo_actual -= data.monto
    else:
        raise HTTPException(status_code=400, detail="Tipo inválido")

    movimiento = _registrar_movimiento(
        db=db,
        user=user,
        bolsillo=bolsillo,
        id_caja=data.id_caja,
        tipo=data.tipo,
        monto=data.monto,
        motivo=data.motivo,
    )

    registrar_log(
        db,
        user.id_usuario,
        "Movimiento bolsillo",
        f"{data.tipo} ${data.monto} -> {bolsillo.nombre}",
    )
    return movimiento


@router.post("/pago", response_model=MovimientoBolsilloResponse)
def hacer_pago_bolsillo(
    data: PagoBolsilloCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    bolsillo = _obtener_bolsillo_activo(db, data.id_bolsillo)

    if data.monto <= 0:
        raise HTTPException(status_code=400, detail="Monto inválido")

    saldo_actual = Decimal(bolsillo.saldo_actual or 0)
    if data.monto > saldo_actual:
        raise HTTPException(status_code=400, detail="Saldo insuficiente en el bolsillo")

    bolsillo.saldo_actual = saldo_actual - data.monto
    movimiento = _registrar_movimiento(
        db=db,
        user=user,
        bolsillo=bolsillo,
        id_caja=data.id_caja,
        tipo="pago",
        monto=data.monto,
        motivo=data.motivo,
    )

    registrar_log(
        db,
        user.id_usuario,
        "Pago bolsillo",
        f"Pago de ${data.monto} desde {bolsillo.nombre}",
    )
    return movimiento


@router.get("/movimientos", response_model=List[MovimientoBolsilloResponse])
def listar_movimientos(
    desde: date | None = None,
    hasta: date | None = None,
    db: Session = Depends(get_db),
):
    hoy = date.today()
    if not desde:
        desde = hoy - timedelta(days=1)
    if not hasta:
        hasta = hoy

    inicio = datetime.combine(desde, time.min)
    fin = datetime.combine(hasta, time.max)

    movimientos = (
        db.query(
            BolsilloMovimiento.id_movimiento,
            BolsilloMovimiento.id_bolsillo,
            Bolsillo.nombre.label("nombre_bolsillo"),
            BolsilloMovimiento.id_usuario,
            Usuario.nombre.label("nombre_usuario"),
            BolsilloMovimiento.tipo,
            BolsilloMovimiento.monto,
            BolsilloMovimiento.motivo,
            BolsilloMovimiento.fecha,
        )
        .join(Bolsillo, Bolsillo.id_bolsillo == BolsilloMovimiento.id_bolsillo)
        .join(Usuario, Usuario.id_usuario == BolsilloMovimiento.id_usuario)
        .filter(BolsilloMovimiento.fecha.between(inicio, fin))
        .order_by(BolsilloMovimiento.fecha.desc())
        .all()
    )

    return [
        {
            "id_movimiento": movimiento.id_movimiento,
            "id_bolsillo": movimiento.id_bolsillo,
            "nombre_bolsillo": movimiento.nombre_bolsillo,
            "id_usuario": movimiento.id_usuario,
            "nombre_usuario": movimiento.nombre_usuario,
            "tipo": movimiento.tipo,
            "monto": movimiento.monto,
            "motivo": movimiento.motivo,
            "fecha": movimiento.fecha,
        }
        for movimiento in movimientos
    ]


@router.get(
    "/cierre-dia",
    response_model=CierreDiaRangoResponse,
    summary="Resumen de ventas por rango de fechas",
)
def cierre_dia(
    desde: Optional[date] = Query(None, description="Fecha inicio (YYYY-MM-DD)"),
    hasta: Optional[date] = Query(None, description="Fecha fin (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    if not hasta:
        hasta = date.today()
    if not desde:
        desde = hasta - timedelta(days=1)

    inicio = datetime.combine(desde, time.min)
    fin = datetime.combine(hasta, time.max)

    cajas = db.query(Caja.id_caja, Caja.nombre, Caja.saldo_actual).all()

    ventas_productos = (
        db.query(
            Producto.nombre.label("producto"),
            Producto.imagen.label("imagen"),
            Marca.nombre.label("marca"),
            func.coalesce(func.sum(DetalleVenta.cantidad), 0).label("cantidad"),
            func.coalesce(func.sum(DetalleVenta.subtotal), 0).label("total"),
        )
        .join(DetalleVenta)
        .join(Venta)
        .join(Marca, Marca.id_marca == Producto.id_marca)
        .filter(Venta.fecha_venta.between(inicio, fin))
        .group_by(Producto.id_producto)
        .all()
    )

    ventas_marcas = (
        db.query(
            Marca.nombre.label("marca"),
            func.sum(DetalleVenta.cantidad).label("cantidad"),
            func.sum(DetalleVenta.subtotal).label("total"),
        )
        .join(Producto, Producto.id_marca == Marca.id_marca)
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .join(Venta, Venta.id_venta == DetalleVenta.id_venta)
        .filter(Venta.fecha_venta.between(inicio, fin))
        .group_by(Marca.id_marca)
        .all()
    )

    ventas_categorias = (
        db.query(
            Categoria.nombre.label("categoria"),
            func.sum(DetalleVenta.cantidad).label("cantidad"),
            func.sum(DetalleVenta.subtotal).label("total"),
        )
        .join(Marca, Marca.id_categoria == Categoria.id_categoria)
        .join(Producto, Producto.id_marca == Marca.id_marca)
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .join(Venta, Venta.id_venta == DetalleVenta.id_venta)
        .filter(Venta.fecha_venta.between(inicio, fin))
        .group_by(Categoria.id_categoria)
        .all()
    )

    return {
        "desde": desde,
        "hasta": hasta,
        "cajas": [
            {"id_caja": c.id_caja, "nombre": c.nombre, "saldo_actual": c.saldo_actual}
            for c in cajas
        ],
        "ventas_por_producto": [
            {
                "producto": v.producto,
                "imagen": v.imagen,
                "marca": v.marca,
                "cantidad": v.cantidad,
                "total": v.total,
            }
            for v in ventas_productos
        ],
        "ventas_por_marca": [
            {"marca": v.marca, "cantidad": v.cantidad, "total": v.total}
            for v in ventas_marcas
        ],
        "ventas_por_categoria": [
            {"categoria": v.categoria, "cantidad": v.cantidad, "total": v.total}
            for v in ventas_categorias
        ],
    }


@router.post("/cierre-dia", response_model=CierreDiaResponse)
def guardar_cierre_dia(
    data: CierreDiaCreate,
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    existe = db.query(CierreDia).filter(CierreDia.fecha == data.fecha).first()
    if existe:
        raise HTTPException(status_code=400, detail="El cierre de este día ya existe")

    inicio = datetime.combine(data.fecha, time.min)
    fin = datetime.combine(data.fecha, time.max)

    total_ventas = db.query(func.coalesce(func.sum(Venta.total), 0)).filter(
        Venta.fecha_venta.between(inicio, fin),
        Venta.estado == "pagada",
    ).scalar()

    saldo_caja = Decimal(
        db.query(func.coalesce(Caja.saldo_actual, 0))
        .filter(Caja.id_caja == 1)
        .scalar()
    )

    cantidad_a_dejar = Decimal(data.cantidad_a_dejar)

    if cantidad_a_dejar < 0:
        raise HTTPException(status_code=400, detail="La cantidad a dejar no puede ser negativa")

    if cantidad_a_dejar > saldo_caja:
        raise HTTPException(
            status_code=400,
            detail="La cantidad a dejar no puede ser mayor al saldo de la caja",
        )

    total_enviado_bolsillos = saldo_caja - cantidad_a_dejar

    caja_principal = db.query(Caja).filter(Caja.id_caja == 1).first()
    caja_principal.saldo_actual = cantidad_a_dejar

    saldos_cajas = db.query(
        Caja.id_caja,
        Caja.nombre,
        func.coalesce(Caja.saldo_actual, 0).label("saldo")
    ).all()

    saldo_cajas = {
        f"saldo_{id_caja}": saldo
        for id_caja, _, saldo in saldos_cajas
    }

    total_productos = db.query(func.coalesce(func.sum(DetalleVenta.cantidad), 0)).join(Venta).filter(
        Venta.fecha_venta.between(inicio, fin)
    ).scalar()

    redis_pos.set(
        REDIS_KEY_TOTAL_BOLSILLOS,
        str(total_enviado_bolsillos)
    )
    redis_pos.set(REDIS_KEY_FECHA_CIERRE, data.fecha.isoformat())

    texto_observaciones = []

    for _, nombre, saldo in saldos_cajas:
        texto_observaciones.append(
            f"{nombre}: ${saldo}"
        )

    texto_observaciones.append(
        f"Productos vendidos: {total_productos}"
    )

    if data.observaciones:
        texto_observaciones.append("")
        texto_observaciones.append("Observaciones:")
        texto_observaciones.append(data.observaciones)

    cierre = CierreDia(
        fecha=data.fecha,
        id_caja=1,
        total_ventas=total_ventas,
        saldo_caja=saldo_caja,
        cantidad_a_dejar=cantidad_a_dejar,
        total_enviado_bolsillos=total_enviado_bolsillos,
        observaciones="\n".join(texto_observaciones),
        id_usuario=user.id_usuario,
    )

    db.add(cierre)
    db.flush()

    pagos = (
        db.query(
            MetodoPago.id_metodo,
            MetodoPago.nombre,
            func.sum(PagoVenta.monto).label("total"),
        )
        .join(PagoVenta)
        .join(Venta)
        .filter(
            Venta.fecha_venta.between(inicio, fin),
            Venta.estado == "pagada",
        )
        .group_by(MetodoPago.id_metodo)
        .all()
    )

    for id_metodo, _, total in pagos:
        db.add(CierreMetodoPago(id_cierre=cierre.id_cierre, id_metodo_pago=id_metodo, total=total))

    db.commit()
    db.refresh(cierre)

    registrar_log(db, user.id_usuario, "Cierre de día", f"Cierre realizado para {data.fecha}")

    return {
        "id_cierre": cierre.id_cierre,
        "fecha": cierre.fecha,
        "saldo_cajas": saldo_cajas,
        "total_ventas": cierre.total_ventas,
        "total_productos": total_productos,
        "cantidad_a_dejar": cierre.cantidad_a_dejar,
        "total_enviado_bolsillos": cierre.total_enviado_bolsillos,
        "metodos_pago": [
            {
                "id_metodo_pago": d.id_metodo_pago,
                "nombre": d.metodo_pago.nombre,
                "total": d.total,
            }
            for d in cierre.metodos_pago
        ],
        "observaciones": cierre.observaciones,
        "fecha_cierre": cierre.fecha_cierre,
    }
