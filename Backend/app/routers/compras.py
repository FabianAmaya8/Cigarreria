from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_user
from app.database import get_db
from app.models.almacenes import Almacen
from app.models.bolsillo import Bolsillo
from app.models.bolsilloMovimiento import BolsilloMovimiento
from app.models.cajas import Caja
from app.models.compras import Compra
from app.models.compensaciones import Compensacion
from app.models.devoluciones_compra import DevolucionCompra
from app.models.detalle_compra import DetalleCompra
from app.models.detalle_devolucion_compra import DetalleDevolucionCompra
from app.models.inventario import Inventario
from app.models.libro_mayor import LibroMayor
from app.models.movimientos_inventario import MovimientoInventario
from app.models.pago_origen import PagoOrigen
from app.models.pagos_compra import PagoCompra
from app.models.productos import Producto
from app.models.proveedores import Proveedor
from app.models.proveedores_productos import ProveedorProducto
from app.models.usuarios import Usuario
from app.schemas.proveedores import (
    AlertaCompraResponse,
    AnularPagoResponse,
    CompensacionCreate,
    CompensacionPendienteResponse,
    CompensacionResponse,
    CompraCreate,
    CompraPendientePagoResponse,
    CompraResponse,
    CompraUpdate,
    DevolucionCompraCreate,
    DevolucionCompraResponse,
    DetalleCompraRecepcionCreate,
    DetalleCompraResponse,
    DetalleDevolucionCompraCreate,
    HistorialPrecioResponse,
    LibroMayorResponse,
    PagoCompraCreate,
    PagoCompraResponse,
    RecepcionCompraCreate,
)
from app.utils.registrar_logs import registrar_log
from app.utils.registrar_mov_inv import registrar_movimiento_inventario

router = APIRouter(prefix="/api/compras", tags=["Compras"])

CAJA_POR_DEFECTO_ID = 1
ALMACEN_POR_DEFECTO_ID = 2


def _d(valor) -> Decimal:
    if valor is None:
        return Decimal("0")
    return Decimal(str(valor))


def _obtener_proveedor(db: Session, id_proveedor: int) -> Proveedor:
    proveedor = db.query(Proveedor).filter(Proveedor.id_proveedor == id_proveedor).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor


def _obtener_compra(db: Session, id_compra: int) -> Compra:
    compra = (
        db.query(Compra)
        .options(
            joinedload(Compra.proveedor),
            joinedload(Compra.detalles).joinedload(DetalleCompra.producto),
            joinedload(Compra.pagos).joinedload(PagoCompra.origenes),
            joinedload(Compra.compensaciones),
            joinedload(Compra.devoluciones).joinedload(DevolucionCompra.detalles),
        )
        .filter(Compra.id_compra == id_compra)
        .first()
    )
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    return compra


def _total_pagado_activo(db: Session, id_compra: int) -> Decimal:
    total = (
        db.query(func.coalesce(func.sum(PagoCompra.monto), 0))
        .filter(PagoCompra.id_compra == id_compra, PagoCompra.estado == "registrado")
        .scalar()
    )
    return _d(total)


def _saldo_pendiente(compra: Compra, total_pagado: Optional[Decimal] = None) -> Decimal:
    total_pagado = _d(total_pagado if total_pagado is not None else 0)
    saldo = _d(compra.total) - total_pagado
    return saldo if saldo > 0 else Decimal("0")


def _recalcular_estado_pago(compra: Compra, total_pagado: Decimal) -> None:
    if total_pagado <= 0:
        compra.estado_pago = "pendiente"
    elif total_pagado < _d(compra.total):
        compra.estado_pago = "parcial"
    else:
        compra.estado_pago = "pagada"


def _estado_recepcion_desde_detalles(detalles: List[DetalleCompra]) -> str:
    if not detalles:
        return "pendiente"
    cantidades = [int(det.cantidad_recibida or 0) for det in detalles]
    if all(c == 0 for c in cantidades):
        return "pendiente"
    if all(int(det.cantidad_recibida or 0) >= int(det.cantidad_solicitada or 0) for det in detalles):
        return "completa"
    return "parcial"


def _serializar_detalle(detalle: DetalleCompra) -> DetalleCompraResponse:
    producto = detalle.producto
    return DetalleCompraResponse(
        id_detalle_compra=detalle.id_detalle_compra,
        id_producto=detalle.id_producto,
        producto=None if not producto else {
            "id_producto": producto.id_producto,
            "codigo_barras": producto.codigo_barras,
            "nombre": producto.nombre,
            "imagen": producto.imagen,
            "activo": producto.activo,
        },
        cantidad_solicitada=detalle.cantidad_solicitada,
        cantidad_recibida=detalle.cantidad_recibida,
        precio_pedido=detalle.precio_pedido,
        precio_recibido=detalle.precio_recibido,
        estado=detalle.estado,
        subtotal_pedido=detalle.subtotal_pedido,
        subtotal_recibido=detalle.subtotal_recibido,
    )


def _serializar_compra(db: Session, compra: Compra) -> CompraResponse:
    total_pagado = _total_pagado_activo(db, compra.id_compra)
    return CompraResponse(
        id_compra=compra.id_compra,
        proveedor=compra.proveedor,
        fecha_pedido=compra.fecha_pedido,
        fecha_recepcion=compra.fecha_recepcion,
        fecha_entrega=compra.fecha_entrega,
        numero_factura=compra.numero_factura,
        archivo_factura=compra.archivo_factura,
        estado_pedido=compra.estado_pedido,
        estado_recepcion=compra.estado_recepcion,
        estado_pago=compra.estado_pago,
        total=compra.total,
        total_pagado=total_pagado,
        saldo_pendiente=_saldo_pendiente(compra, total_pagado),
        observaciones=compra.observaciones,
        detalles=[_serializar_detalle(detalle) for detalle in compra.detalles],
    )


def _asegurar_relacion_proveedor_producto(db: Session, id_proveedor: int, id_producto: int) -> None:
    existe = (
        db.query(ProveedorProducto)
        .filter(
            ProveedorProducto.id_proveedor == id_proveedor,
            ProveedorProducto.id_producto == id_producto,
        )
        .first()
    )
    if not existe:
        db.add(ProveedorProducto(id_proveedor=id_proveedor, id_producto=id_producto))


def _precio_anterior_promedio(db: Session, id_proveedor: int, id_producto: int, fecha_referencia: datetime) -> Decimal:
    precio = (
        db.query(func.avg(DetalleCompra.precio_recibido))
        .join(Compra, Compra.id_compra == DetalleCompra.id_compra)
        .filter(
            Compra.id_proveedor == id_proveedor,
            DetalleCompra.id_producto == id_producto,
            Compra.fecha_pedido < fecha_referencia,
            DetalleCompra.precio_recibido.isnot(None),
        )
        .scalar()
    )
    if precio is None:
        precio = (
            db.query(func.avg(DetalleCompra.precio_pedido))
            .join(Compra, Compra.id_compra == DetalleCompra.id_compra)
            .filter(
                Compra.id_proveedor == id_proveedor,
                DetalleCompra.id_producto == id_producto,
                Compra.fecha_pedido < fecha_referencia,
            )
            .scalar()
        )
    return _d(precio)


@router.get("/", response_model=List[CompraResponse])
def listar_compras(
    id_proveedor: Optional[int] = Query(None),
    estado_pago: Optional[str] = Query(None),
    estado_recepcion: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    print("1. Entró a listar_compras")

    query = db.query(Compra).options(
        joinedload(Compra.proveedor),
        joinedload(Compra.detalles).joinedload(DetalleCompra.producto),
        joinedload(Compra.pagos).joinedload(PagoCompra.origenes),
    )

    print("2. Query creada")

    if id_proveedor is not None:
        query = query.filter(Compra.id_proveedor == id_proveedor)

    if estado_pago:
        query = query.filter(Compra.estado_pago == estado_pago)

    if estado_recepcion:
        query = query.filter(Compra.estado_recepcion == estado_recepcion)

    print("3. Antes del .all()")

    compras = query.order_by(Compra.fecha_pedido.desc()).all()

    print("4. Compras encontradas:", len(compras))

    resultado = []

    for compra in compras:
        print("5. Serializando compra:", compra.id_compra)
        resultado.append(_serializar_compra(db, compra))

    print("6. Serialización terminada")

    return resultado

@router.get("/{id_compra}", response_model=CompraResponse)
def obtener_compra(id_compra: int, db: Session = Depends(get_db)):
    return _serializar_compra(db, _obtener_compra(db, id_compra))


@router.post("/", response_model=CompraResponse)
def crear_compra(
    data: CompraCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if not data.detalles:
        raise HTTPException(status_code=400, detail="La compra debe incluir al menos un detalle")
    if data.id_proveedor is None:
        raise HTTPException(status_code=400, detail="El proveedor es obligatorio")

    proveedor = _obtener_proveedor(db, data.id_proveedor)
    if not proveedor.activo and proveedor.nombre.upper() != "YO":
        raise HTTPException(status_code=400, detail="No se pueden crear compras a proveedores inactivos")

    try:
        compra = Compra(
            id_proveedor=proveedor.id_proveedor,
            numero_factura=data.numero_factura,
            archivo_factura=data.archivo_factura,
            fecha_entrega=data.fecha_entrega,
            observaciones=data.observaciones,
            total=Decimal("0"),
            estado_pedido="pendiente",
            estado_recepcion="pendiente",
            estado_pago="pendiente",
        )
        db.add(compra)
        db.flush()

        total = Decimal("0")
        for item in data.detalles:
            if item.cantidad_solicitada <= 0:
                raise HTTPException(status_code=400, detail="La cantidad solicitada debe ser mayor a 0")
            if _d(item.precio_pedido) <= 0:
                raise HTTPException(status_code=400, detail="El precio pedido debe ser mayor a 0")

            producto = db.query(Producto).filter(Producto.id_producto == item.id_producto).first()
            if not producto:
                raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")

            _asegurar_relacion_proveedor_producto(db, proveedor.id_proveedor, producto.id_producto)

            db.add(
                DetalleCompra(
                    id_compra=compra.id_compra,
                    id_producto=producto.id_producto,
                    cantidad_solicitada=item.cantidad_solicitada,
                    cantidad_recibida=0,
                    precio_pedido=_d(item.precio_pedido),
                    precio_recibido=None,
                    estado="pendiente",
                )
            )
            total += _d(item.cantidad_solicitada) * _d(item.precio_pedido)

        compra.total = total
        registrar_log(db, current_user.id_usuario, "Crear compra", f"Compra creada para proveedor {proveedor.nombre}", tabla="compras", commit=False)
        db.commit()
        db.refresh(compra)
        return _serializar_compra(db, _obtener_compra(db, compra.id_compra))
    except Exception:
        db.rollback()
        raise


@router.put("/{id_compra}", response_model=CompraResponse)
def actualizar_compra(
    id_compra: int,
    data: CompraUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    compra = _obtener_compra(db, id_compra)
    if compra.fecha_recepcion is not None:
        raise HTTPException(status_code=400, detail="No se puede editar una compra ya recibida")

    if data.id_proveedor is not None:
        proveedor = _obtener_proveedor(db, data.id_proveedor)
        if not proveedor.activo and proveedor.nombre.upper() != "YO":
            raise HTTPException(status_code=400, detail="No se pueden asignar proveedores inactivos")
        compra.id_proveedor = data.id_proveedor

    for campo in (
            "numero_factura",
            "archivo_factura",
            "fecha_entrega",
            "observaciones",
            "estado_pedido",
            "estado_recepcion",
            "estado_pago"
        ):
        valor = getattr(data, campo)
        if valor is not None:
            setattr(compra, campo, valor)

    registrar_log(db, current_user.id_usuario, "Actualizar compra", f"Compra actualizada: {compra.id_compra}", tabla="compras", commit=False)
    db.commit()
    db.refresh(compra)
    return _serializar_compra(db, _obtener_compra(db, compra.id_compra))

@router.post("/{id_compra}/recepcion", response_model=CompraResponse)
def recibir_compra(
    id_compra: int,
    data: RecepcionCompraCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    compra = _obtener_compra(db, id_compra)
    if compra.fecha_recepcion is not None:
        raise HTTPException(status_code=400, detail="Esta compra ya fue recibida")

    almacen_destino = db.query(Almacen).filter(Almacen.id_almacen == (data.id_almacen_destino or ALMACEN_POR_DEFECTO_ID)).first()
    if not almacen_destino or not almacen_destino.activo:
        raise HTTPException(status_code=404, detail="Almacen destino no encontrado o inactivo")

    mapa_detalles = {detalle.id_detalle_compra: detalle for detalle in compra.detalles}
    alertas: List[AlertaCompraResponse] = []

    try:
        for item in data.detalles:
            detalle = mapa_detalles.get(item.id_detalle_compra)
            if not detalle:
                raise HTTPException(status_code=404, detail=f"Detalle {item.id_detalle_compra} no encontrado")
            if item.cantidad_recibida < 0:
                raise HTTPException(status_code=400, detail="La cantidad recibida no puede ser negativa")
            if item.cantidad_recibida > detalle.cantidad_solicitada:
                raise HTTPException(status_code=400, detail="No se puede recibir mas de lo solicitado")

            precio_recibido = _d(item.precio_recibido) if item.precio_recibido is not None else _d(detalle.precio_pedido)
            if precio_recibido <= 0:
                raise HTTPException(status_code=400, detail="El precio recibido debe ser mayor a 0")

            detalle.cantidad_recibida = item.cantidad_recibida
            detalle.precio_recibido = precio_recibido
            if item.cantidad_recibida == 0:
                detalle.estado = "no_recibido"
            elif item.cantidad_recibida < detalle.cantidad_solicitada:
                detalle.estado = "parcial"
            else:
                detalle.estado = "completo"

            if item.cantidad_recibida > 0:
                inventario = (
                    db.query(Inventario)
                    .filter(
                        Inventario.id_producto == detalle.id_producto,
                        Inventario.id_almacen == almacen_destino.id_almacen,
                    )
                    .with_for_update()
                    .first()
                )
                if not inventario:
                    inventario = Inventario(id_producto=detalle.id_producto, id_almacen=almacen_destino.id_almacen, stock=0)
                    db.add(inventario)
                    db.flush()

                inventario.stock += item.cantidad_recibida
                registrar_movimiento_inventario(
                    db=db,
                    id_producto=detalle.id_producto,
                    tipo="entrada",
                    cantidad=item.cantidad_recibida,
                    id_usuario=current_user.id_usuario,
                    motivo=f"Recepcion de compra {compra.id_compra}",
                    id_almacen_destino=almacen_destino.id_almacen,
                    id_detalle_compra=detalle.id_detalle_compra,
                    commit=False,
                )

            precio_base = _precio_anterior_promedio(db, compra.id_proveedor, detalle.id_producto, compra.fecha_pedido)
            if precio_base > 0 and precio_recibido > precio_base * Decimal("1.2"):
                alertas.append(
                    AlertaCompraResponse(
                        tipo="aumento_precio",
                        mensaje=f"El producto {detalle.producto.nombre if detalle.producto else detalle.id_producto} supero el 20% frente al historico",
                        severidad="warning",
                        id_compra=compra.id_compra,
                        id_producto=detalle.id_producto,
                        id_proveedor=compra.id_proveedor,
                    )
                )

            if precio_recibido != _d(detalle.precio_pedido):
                registrar_log(
                    db,
                    current_user.id_usuario,
                    "Cambio de precio durante recepcion",
                    f"Detalle {detalle.id_detalle_compra}: {detalle.precio_pedido} -> {precio_recibido}",
                    tabla="compras",
                    commit=False,
                )

        compra.fecha_recepcion = datetime.now()
        compra.estado_recepcion = _estado_recepcion_desde_detalles(compra.detalles)
        if any(det.cantidad_recibida > 0 for det in compra.detalles):
            compra.estado_pedido = "completada"
        compra.total = sum((_d(det.subtotal_recibido) for det in compra.detalles), Decimal("0"))
        _recalcular_estado_pago(compra, _total_pagado_activo(db, compra.id_compra))

        registrar_log(db, current_user.id_usuario, "Recepcion de compra", f"Recepcion registrada para compra {compra.id_compra}", tabla="compras", commit=False)
        db.commit()
        db.refresh(compra)
        respuesta = _serializar_compra(db, _obtener_compra(db, compra.id_compra))
        if alertas:
            respuesta.__dict__["alertas"] = alertas
        return respuesta
    except Exception:
        db.rollback()
        raise


@router.post("/{id_compra}/pagos", response_model=PagoCompraResponse)
def registrar_pago_compra(
    id_compra: int,
    data: PagoCompraCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    compra = _obtener_compra(db, id_compra)
    total_pagado = _total_pagado_activo(db, id_compra)
    saldo_pendiente = _saldo_pendiente(compra, total_pagado)

    if data.monto <= 0:
        raise HTTPException(status_code=400, detail="El monto debe ser mayor a 0")
    if data.monto > saldo_pendiente:
        raise HTTPException(status_code=400, detail="No se puede pagar mas del saldo pendiente")

    suma_origenes = sum((_d(origen.monto) for origen in data.origenes), Decimal("0"))
    if suma_origenes != _d(data.monto):
        raise HTTPException(status_code=400, detail="La suma de origenes debe ser igual al monto del pago")

    try:
        pago = PagoCompra(
            id_compra=compra.id_compra,
            id_usuario=current_user.id_usuario,
            monto=_d(data.monto),
            estado="registrado",
            observaciones=data.observaciones,
            fecha_pago=datetime.now(),
        )
        db.add(pago)
        db.flush()

        for origen in data.origenes:
            monto_origen = _d(origen.monto)
            if origen.tipo_origen == "caja":
                caja = db.query(Caja).filter(Caja.id_caja == origen.id_origen).with_for_update().first()
                if not caja or not caja.activo:
                    raise HTTPException(status_code=404, detail="Caja no encontrada o inactiva")
                if _d(caja.saldo_actual) < monto_origen:
                    raise HTTPException(status_code=400, detail="Saldo insuficiente en la caja")
                caja.saldo_actual = _d(caja.saldo_actual) - monto_origen
            else:
                bolsillo = db.query(Bolsillo).filter(Bolsillo.id_bolsillo == origen.id_origen).with_for_update().first()
                if not bolsillo or not bolsillo.activo:
                    raise HTTPException(status_code=404, detail="Bolsillo no encontrado o inactivo")
                if _d(bolsillo.saldo_actual) < monto_origen:
                    raise HTTPException(status_code=400, detail="Saldo insuficiente en el bolsillo")
                bolsillo.saldo_actual = _d(bolsillo.saldo_actual) - monto_origen
                db.add(
                    BolsilloMovimiento(
                        id_bolsillo=bolsillo.id_bolsillo,
                        id_caja=origen.id_caja or CAJA_POR_DEFECTO_ID,
                        id_usuario=current_user.id_usuario,
                        tipo="pago",
                        monto=monto_origen,
                        motivo=origen.observaciones or f"Pago compra {compra.id_compra}",
                    )
                )

            db.add(
                PagoOrigen(
                    id_pago_compra=pago.id_pago_compra,
                    tipo_origen=origen.tipo_origen,
                    id_origen=origen.id_origen,
                    monto=monto_origen,
                    observaciones=origen.observaciones,
                )
            )

        db.add(
            LibroMayor(
                tipo_movimiento="pago_compra",
                origen_tipo="mixto" if len(data.origenes) > 1 else data.origenes[0].tipo_origen,
                origen_id=None if len(data.origenes) > 1 else data.origenes[0].id_origen,
                destino_tipo="proveedor",
                destino_id=compra.id_proveedor,
                monto=_d(data.monto),
                id_usuario=current_user.id_usuario,
                id_compra=compra.id_compra,
                id_pago_compra=pago.id_pago_compra,
                referencia_tipo="pago_compra",
                referencia_id=pago.id_pago_compra,
                concepto=f"Pago de compra {compra.id_compra}",
                observaciones=data.observaciones,
                estado="activo",
            )
        )

        _recalcular_estado_pago(compra, total_pagado + _d(data.monto))
        registrar_log(db, current_user.id_usuario, "Pago de compra", f"Pago registrado para compra {compra.id_compra}", tabla="compras", commit=False)
        db.commit()
        db.refresh(pago)
        return PagoCompraResponse(
            id_pago_compra=pago.id_pago_compra,
            id_compra=pago.id_compra,
            id_usuario=pago.id_usuario,
            monto=pago.monto,
            fecha_pago=pago.fecha_pago,
            estado=pago.estado,
            observaciones=pago.observaciones,
            origenes=pago.origenes,
        )
    except Exception:
        db.rollback()
        raise


@router.post("/pagos/{id_pago_compra}/anular", response_model=AnularPagoResponse)
def anular_pago_compra(
    id_pago_compra: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    pago = db.query(PagoCompra).options(joinedload(PagoCompra.origenes)).filter(PagoCompra.id_pago_compra == id_pago_compra).first()
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    if pago.estado == "anulado":
        raise HTTPException(status_code=400, detail="El pago ya esta anulado")

    compra = _obtener_compra(db, pago.id_compra)

    try:
        for origen in pago.origenes:
            if origen.tipo_origen == "caja":
                caja = db.query(Caja).filter(Caja.id_caja == origen.id_origen).with_for_update().first()
                if caja:
                    caja.saldo_actual = _d(caja.saldo_actual) + _d(origen.monto)
            else:
                bolsillo = db.query(Bolsillo).filter(Bolsillo.id_bolsillo == origen.id_origen).with_for_update().first()
                if bolsillo:
                    bolsillo.saldo_actual = _d(bolsillo.saldo_actual) + _d(origen.monto)
                    db.add(
                        BolsilloMovimiento(
                            id_bolsillo=bolsillo.id_bolsillo,
                            id_caja=origen.id_caja or CAJA_POR_DEFECTO_ID,
                            id_usuario=current_user.id_usuario,
                            tipo="entrada",
                            monto=_d(origen.monto),
                            motivo=f"Anulacion pago compra {compra.id_compra}",
                        )
                    )

        for libro in db.query(LibroMayor).filter(LibroMayor.id_pago_compra == pago.id_pago_compra).all():
            libro.estado = "anulado"

        pago.estado = "anulado"
        total_pagado = _total_pagado_activo(db, compra.id_compra)
        _recalcular_estado_pago(compra, total_pagado)

        registrar_log(db, current_user.id_usuario, "Anular pago", f"Pago anulado: {pago.id_pago_compra}", tabla="compras", commit=False)
        db.commit()
        return AnularPagoResponse(
            id_pago_compra=pago.id_pago_compra,
            estado=pago.estado,
            saldo_pendiente=_saldo_pendiente(compra, total_pagado),
            total_pagado=total_pagado,
        )
    except Exception:
        db.rollback()
        raise

@router.post("/{id_compra}/devoluciones", response_model=DevolucionCompraResponse)
def registrar_devolucion_compra(
    id_compra: int,
    data: DevolucionCompraCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    compra = _obtener_compra(db, id_compra)
    if compra.fecha_recepcion is None:
        raise HTTPException(status_code=400, detail="No se puede devolver una compra no recibida")

    try:
        devolucion = DevolucionCompra(
            id_compra=compra.id_compra,
            id_usuario=current_user.id_usuario,
            fecha=datetime.now(),
            estado="registrada",
            observaciones=data.observaciones,
        )
        db.add(devolucion)
        db.flush()

        total_devolucion = Decimal("0")
        detalles_respuesta = []
        almacen_id = getattr(data, "id_almacen", None) or ALMACEN_POR_DEFECTO_ID

        for item in data.detalles:
            detalle = next((d for d in compra.detalles if d.id_detalle_compra == item.id_detalle_compra), None)
            if not detalle:
                raise HTTPException(status_code=404, detail=f"Detalle {item.id_detalle_compra} no encontrado")

            devuelto_anterior = (
                db.query(func.coalesce(func.sum(DetalleDevolucionCompra.cantidad), 0))
                .join(DevolucionCompra, DevolucionCompra.id_devolucion == DetalleDevolucionCompra.id_devolucion)
                .filter(
                    DetalleDevolucionCompra.id_detalle_compra == detalle.id_detalle_compra,
                    DevolucionCompra.id_compra == compra.id_compra,
                    DevolucionCompra.estado != "rechazada",
                )
                .scalar()
            )
            maximo = int(detalle.cantidad_recibida or 0) - int(devuelto_anterior or 0)
            if item.cantidad > maximo:
                raise HTTPException(status_code=400, detail="No se puede devolver mas de lo recibido")

            detalle_devolucion = DetalleDevolucionCompra(
                id_devolucion=devolucion.id_devolucion,
                id_detalle_compra=detalle.id_detalle_compra,
                cantidad=item.cantidad,
                motivo=item.motivo,
            )
            db.add(detalle_devolucion)
            detalles_respuesta.append(detalle_devolucion)

            cantidad = item.cantidad
            precio_unitario = _d(detalle.precio_recibido or detalle.precio_pedido)
            total_devolucion += _d(cantidad) * precio_unitario

            inventario = (
                db.query(Inventario)
                .filter(
                    Inventario.id_producto == detalle.id_producto,
                    Inventario.id_almacen == almacen_id,
                )
                .with_for_update()
                .first()
            )
            if not inventario or inventario.stock < cantidad:
                raise HTTPException(status_code=400, detail="Stock insuficiente para procesar la devolucion")
            inventario.stock -= cantidad
            registrar_movimiento_inventario(
                db=db,
                id_producto=detalle.id_producto,
                tipo="salida",
                cantidad=cantidad,
                id_usuario=current_user.id_usuario,
                motivo=f"Devolucion compra {compra.id_compra}",
                id_almacen_origen=inventario.id_almacen,
                id_detalle_compra=detalle.id_detalle_compra,
                commit=False,
            )

        db.add(
            LibroMayor(
                tipo_movimiento="devolucion_compra",
                origen_tipo="proveedor",
                origen_id=compra.id_proveedor,
                destino_tipo="caja",
                destino_id=CAJA_POR_DEFECTO_ID,
                monto=total_devolucion,
                id_usuario=current_user.id_usuario,
                id_compra=compra.id_compra,
                referencia_tipo="devolucion_compra",
                referencia_id=devolucion.id_devolucion,
                concepto=f"Devolucion compra {compra.id_compra}",
                observaciones=data.observaciones or data.motivo,
                estado="activo",
            )
        )

        registrar_log(db, current_user.id_usuario, "Devolucion de compra", f"Devolucion registrada para compra {compra.id_compra}", tabla="compras", commit=False)
        db.commit()
        return DevolucionCompraResponse(
            id_devolucion=devolucion.id_devolucion,
            id_compra=devolucion.id_compra,
            id_usuario=devolucion.id_usuario,
            fecha=devolucion.fecha,
            estado=devolucion.estado,
            observaciones=devolucion.observaciones,
            motivo=data.motivo,
            detalles=[
                {
                    "id_detalle_devolucion": d.id_detalle_devolucion,
                    "id_detalle_compra": d.id_detalle_compra,
                    "cantidad": d.cantidad,
                    "motivo": d.motivo,
                }
                for d in detalles_respuesta
            ],
        )
    except Exception:
        db.rollback()
        raise


@router.post("/compensaciones", response_model=CompensacionResponse)
def crear_compensacion(
    data: CompensacionCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    caja = db.query(Caja).filter(Caja.id_caja == data.id_caja).first()
    bolsillo = db.query(Bolsillo).filter(Bolsillo.id_bolsillo == data.id_bolsillo).first()
    if not caja:
        raise HTTPException(status_code=404, detail="Caja no encontrada")
    if not bolsillo:
        raise HTTPException(status_code=404, detail="Bolsillo no encontrado")
    if _d(data.monto_original) <= 0:
        raise HTTPException(status_code=400, detail="Monto invalido")

    try:
        compensacion = Compensacion(
            id_caja=data.id_caja,
            id_bolsillo=data.id_bolsillo,
            id_compra=data.id_compra,
            id_pago_compra=data.id_pago_compra,
            monto_original=_d(data.monto_original),
            monto_compensado=Decimal("0"),
            estado="pendiente",
            fecha_creacion=datetime.now(),
            id_usuario=current_user.id_usuario,
            observaciones=data.observaciones,
        )
        db.add(compensacion)
        db.add(
            LibroMayor(
                tipo_movimiento="compensacion",
                origen_tipo="caja",
                origen_id=data.id_caja,
                destino_tipo="bolsillo",
                destino_id=data.id_bolsillo,
                monto=_d(data.monto_original),
                id_usuario=current_user.id_usuario,
                id_compra=data.id_compra,
                id_pago_compra=data.id_pago_compra,
                referencia_tipo="compensacion",
                referencia_id=None,
                concepto=f"Compensacion caja {data.id_caja} -> bolsillo {data.id_bolsillo}",
                observaciones=data.observaciones,
                estado="activo",
            )
        )
        registrar_log(db, current_user.id_usuario, "Crear compensacion", f"Compensacion creada por {data.monto_original}", tabla="compras", commit=False)
        db.commit()
        db.refresh(compensacion)
        return compensacion
    except Exception:
        db.rollback()
        raise


@router.post("/compensaciones/{id_compensacion}/abonar", response_model=CompensacionResponse)
def abonar_compensacion(
    id_compensacion: int,
    monto: Decimal = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    compensacion = db.query(Compensacion).filter(Compensacion.id_compensacion == id_compensacion).first()
    if not compensacion:
        raise HTTPException(status_code=404, detail="Compensacion no encontrada")

    pendiente = _d(compensacion.monto_original) - _d(compensacion.monto_compensado)
    if monto > pendiente:
        raise HTTPException(status_code=400, detail="El monto supera el pendiente")

    try:
        compensacion.monto_compensado = _d(compensacion.monto_compensado) + _d(monto)
        compensacion.fecha_ultima_compensacion = datetime.now()
        if _d(compensacion.monto_compensado) <= 0:
            compensacion.estado = "pendiente"
        elif _d(compensacion.monto_compensado) < _d(compensacion.monto_original):
            compensacion.estado = "parcial"
        else:
            compensacion.estado = "compensada"

        db.add(
            LibroMayor(
                tipo_movimiento="compensacion",
                origen_tipo="bolsillo",
                origen_id=compensacion.id_bolsillo,
                destino_tipo="caja",
                destino_id=compensacion.id_caja,
                monto=_d(monto),
                id_usuario=current_user.id_usuario,
                id_compra=compensacion.id_compra,
                id_pago_compra=compensacion.id_pago_compra,
                referencia_tipo="compensacion_abono",
                referencia_id=compensacion.id_compensacion,
                concepto=f"Abono compensacion {compensacion.id_compensacion}",
                observaciones=compensacion.observaciones,
                estado="activo",
            )
        )
        registrar_log(db, current_user.id_usuario, "Abonar compensacion", f"Compensacion {compensacion.id_compensacion} abonada por {monto}", tabla="compras", commit=False)
        db.commit()
        db.refresh(compensacion)
        return compensacion
    except Exception:
        db.rollback()
        raise


@router.get("/reportes/compras-pendientes", response_model=List[CompraPendientePagoResponse])
def compras_pendientes_pago(db: Session = Depends(get_db)):
    compras = db.query(Compra).options(joinedload(Compra.proveedor)).filter(Compra.estado_pago.in_(["pendiente", "parcial"])).order_by(Compra.fecha_pedido.desc()).all()
    resultado = []
    for compra in compras:
        total_pagado = _total_pagado_activo(db, compra.id_compra)
        resultado.append(
            CompraPendientePagoResponse(
                id_compra=compra.id_compra,
                proveedor=compra.proveedor.nombre if compra.proveedor else None,
                total=compra.total,
                total_pagado=total_pagado,
                saldo_pendiente=_saldo_pendiente(compra, total_pagado),
                estado_pago=compra.estado_pago,
                fecha_pedido=compra.fecha_pedido,
                numero_factura=compra.numero_factura,
            )
        )
    return resultado


@router.get("/reportes/historial-precios", response_model=List[HistorialPrecioResponse])
def historial_precios(
    id_producto: Optional[int] = Query(None),
    id_proveedor: Optional[int] = Query(None),
    desde: Optional[datetime] = Query(None),
    hasta: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            Compra.id_compra,
            DetalleCompra.id_detalle_compra,
            DetalleCompra.id_producto,
            Producto.nombre.label("producto"),
            Compra.fecha_pedido,
            Compra.fecha_recepcion,
            Compra.fecha_entrega,
            DetalleCompra.precio_pedido,
            DetalleCompra.precio_recibido,
            DetalleCompra.cantidad_solicitada,
            DetalleCompra.cantidad_recibida,
            Proveedor.nombre.label("proveedor"),
        )
        .join(DetalleCompra, DetalleCompra.id_compra == Compra.id_compra)
        .join(Producto, Producto.id_producto == DetalleCompra.id_producto)
        .outerjoin(Proveedor, Proveedor.id_proveedor == Compra.id_proveedor)
    )

    if id_producto is not None:
        query = query.filter(DetalleCompra.id_producto == id_producto)
    if id_proveedor is not None:
        query = query.filter(Compra.id_proveedor == id_proveedor)
    if desde is not None:
        query = query.filter(Compra.fecha_pedido >= desde)
    if hasta is not None:
        query = query.filter(Compra.fecha_pedido <= hasta)

    filas = query.order_by(Compra.fecha_pedido.desc()).all()
    return [
        HistorialPrecioResponse(
            id_compra=f.id_compra,
            id_detalle_compra=f.id_detalle_compra,
            id_producto=f.id_producto,
            producto=f.producto,
            proveedor=f.proveedor,
            fecha_pedido=f.fecha_pedido,
            fecha_recepcion=f.fecha_recepcion,
            fecha_entrega=f.fecha_entrega,
            precio_pedido=f.precio_pedido,
            precio_recibido=f.precio_recibido,
            cantidad_solicitada=f.cantidad_solicitada,
            cantidad_recibida=f.cantidad_recibida,
        )
        for f in filas
    ]


@router.get("/reportes/compensaciones-pendientes", response_model=List[CompensacionPendienteResponse])
def compensaciones_pendientes(db: Session = Depends(get_db)):
    compensaciones = db.query(Compensacion).options(joinedload(Compensacion.caja), joinedload(Compensacion.bolsillo)).filter(Compensacion.estado.in_(["pendiente", "parcial"])).all()
    return [
        CompensacionPendienteResponse(
            id_compensacion=c.id_compensacion,
            caja=c.caja.nombre if c.caja else str(c.id_caja),
            bolsillo=c.bolsillo.nombre if c.bolsillo else str(c.id_bolsillo),
            monto_original=c.monto_original,
            monto_compensado=c.monto_compensado,
            monto_pendiente=c.monto_pendiente,
            estado=c.estado,
        )
        for c in compensaciones
    ]


@router.get("/reportes/libro-mayor", response_model=List[LibroMayorResponse])
def reporte_libro_mayor(
    desde: Optional[datetime] = Query(None),
    hasta: Optional[datetime] = Query(None),
    tipo_movimiento: Optional[str] = Query(None),
    origen_tipo: Optional[str] = Query(None),
    destino_tipo: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(LibroMayor)
    if desde is not None:
        query = query.filter(LibroMayor.fecha >= desde)
    if hasta is not None:
        query = query.filter(LibroMayor.fecha <= hasta)
    if tipo_movimiento:
        query = query.filter(LibroMayor.tipo_movimiento == tipo_movimiento)
    if origen_tipo:
        query = query.filter(LibroMayor.origen_tipo == origen_tipo)
    if destino_tipo:
        query = query.filter(LibroMayor.destino_tipo == destino_tipo)
    return query.order_by(LibroMayor.fecha.desc()).all()


@router.get("/{id_compra}/alertas", response_model=List[AlertaCompraResponse])
def alertas_compra(id_compra: int, db: Session = Depends(get_db)):
    compra = _obtener_compra(db, id_compra)
    total_pagado = _total_pagado_activo(db, id_compra)
    alertas: List[AlertaCompraResponse] = []

    saldo = _saldo_pendiente(compra, total_pagado)
    if saldo > 0:
        alertas.append(
            AlertaCompraResponse(
                tipo="compra_no_pagada",
                mensaje=f"La compra {compra.id_compra} tiene saldo pendiente de {saldo}",
                severidad="info",
                id_compra=compra.id_compra,
                id_proveedor=compra.id_proveedor,
            )
        )

    for detalle in compra.detalles:
        precio_base = _precio_anterior_promedio(db, compra.id_proveedor, detalle.id_producto, compra.fecha_pedido)
        precio_actual = _d(detalle.precio_recibido or detalle.precio_pedido)
        if precio_base > 0 and precio_actual > precio_base * Decimal("1.2"):
            alertas.append(
                AlertaCompraResponse(
                    tipo="aumento_precio",
                    mensaje=f"El producto {detalle.producto.nombre if detalle.producto else detalle.id_producto} aumento mas del 20%",
                    severidad="warning",
                    id_compra=compra.id_compra,
                    id_producto=detalle.id_producto,
                    id_proveedor=compra.id_proveedor,
                )
            )

    return alertas
