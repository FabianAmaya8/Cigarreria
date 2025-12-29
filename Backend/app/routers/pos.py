from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
import json
import os
from app.database import get_db
from app.core.redis import redis_pos
from app.core.security import get_current_user
from app.utils.registrar_logs import registrar_log
from app.utils.registrar_mov_inv import registrar_movimiento_inventario
from app.schemas.pos import (POSAgregarProducto, POSEditarProducto, POSCerrarMesa, MetodoPagoResponse,
                            POSCerrarMesaResponse, POSAgregarDistinto, POSEditarDistinto)
from app.models.productos import Producto
from app.models.ventas import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.pagos_venta import PagoVenta
from app.models.deudas import Deuda
from app.models.detalle_deuda import DetalleDeuda
from app.models.cajas import Caja
from app.models.metodos_pago import MetodoPago
from app.models.inventario import Inventario
from app.models.usuarios import Usuario

router = APIRouter(
    prefix="/api/pos",
    tags=["POS"]
)

TTL_MESA = int(os.getenv("REDIS_TTL_MESA", 86400))  # 24 horas si no se define

ID_VITRINA = 2

CAJA_PRODUCTOS = 1
CAJA_CHANCE = 2
CAJA_RECARGAS = 3

# -------------------------------------------------
# Validar stock por almacén
# -------------------------------------------------
def validar_stock(
    db: Session,
    id_producto: int,
    cantidad: int,
    id_almacen: int
):
    inv = db.query(Inventario).filter(
        Inventario.id_producto == id_producto,
        Inventario.id_almacen == id_almacen
    ).first()

    if not inv:
        raise HTTPException(
            status_code=400,
            detail=f"Producto no existe en el almacén {id_almacen}"
        )

    if inv.stock < cantidad:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente (Disponible: {inv.stock})"
        )

# -------------------------------------------------
# Calcular totales por cajas
# -------------------------------------------------
def calcular_totales_por_caja(mesa: dict):
    return {
        "productos": sum(p["subtotal"] for p in mesa.get("productos", [])),
        "recargas": sum(r["valor"] for r in mesa.get("recargas", [])),
        "chance": sum(c["valor"] for c in mesa.get("chance", [])),
    }

def recalcular_total_mesa(mesa: dict):
    totales = calcular_totales_por_caja(mesa)
    mesa["total"] = sum(totales.values())

# -------------------------------------------------
# Descontar stock real (por almacén)
# -------------------------------------------------
def descontar_stock(db: Session, productos: list):
    for p in productos:
        inv = db.query(Inventario).filter(
            Inventario.id_producto == p["id_producto"],
            Inventario.id_almacen == p["id_almacen"]
        ).with_for_update().first()

        if not inv:
            raise HTTPException(
                status_code=400,
                detail=f"No existe inventario para {p['nombre']}"
            )

        if inv.stock < p["cantidad"]:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {p['nombre']}"
            )

        inv.stock -= p["cantidad"]

# -------------------------------------------------
# Obtener estado de mesa
# -------------------------------------------------
@router.get("/mesas/{id_mesa}")
def obtener_mesa(id_mesa: int):
    key = f"pos:mesa:{id_mesa}"
    data = redis_pos.get(key)

    if not data:
        return {
            "id_mesa": id_mesa,
            "estado": "abierta",
            "fecha_creacion": datetime.now().isoformat(),
            "productos": [],
            "recargas": [],
            "chance": [],
            "total": 0
        }

    return json.loads(data)

# -------------------------------------------------
# listar mesas abiertas
# -------------------------------------------------
@router.get("/mesas")
def listar_mesas():
    mesas = []
    cursor = 0

    while True:
        cursor, keys = redis_pos.scan(cursor, match="pos:mesa:*", count=50)

        for key in keys:
            key_str = key
            id_mesa = int(key_str.split(":")[-1])

            data = redis_pos.get(key)
            if not data:
                continue

            mesa = json.loads(data)

            mesas.append({
                "id_mesa": id_mesa,
                "estado": mesa.get("estado", "abierta"),
                "total": mesa.get("total", 0),
                "cantidad_items": sum(
                    p["cantidad"] for p in mesa.get("productos", [])
                )
            })

        if cursor == 0:
            break

    mesas.sort(key=lambda m: m["id_mesa"])

    return mesas

# -------------------------------------------------
# Agregar producto a mesa
# -------------------------------------------------
@router.post("/mesas/{id_mesa}/agregar")
def agregar_producto(
    id_mesa: int,
    data: POSAgregarProducto,
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(
        Producto.codigo_barras == data.codigo_barras,
        Producto.activo == True
    ).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    id_almacen = data.id_almacen or ID_VITRINA

    key = f"pos:mesa:{id_mesa}"
    mesa_data = redis_pos.get(key)

    mesa = json.loads(mesa_data) if mesa_data else {
        "id_mesa": id_mesa,
        "estado": "abierta",
        "fecha_creacion": datetime.now().isoformat(),
        "productos": [],
        "recargas": [],
        "chance": [],
        "total": 0
    }

    cantidad_actual = 0

    for p in mesa["productos"]:
        if p["id_producto"] == producto.id_producto and p["id_almacen"] == id_almacen:
            cantidad_actual = p["cantidad"]
            break

    validar_stock(
        db,
        producto.id_producto,
        cantidad_actual + data.cantidad,
        id_almacen
    )

    for p in mesa["productos"]:
        if p["id_producto"] == producto.id_producto and p["id_almacen"] == id_almacen:
            p["cantidad"] += data.cantidad
            p["subtotal"] = p["cantidad"] * p["precio_unitario"]
            break
    else:
        mesa["productos"].append({
            "id_producto": producto.id_producto,
            "codigo_barras": producto.codigo_barras,
            "nombre": producto.nombre,
            "precio_unitario": float(producto.precio_venta),
            "cantidad": data.cantidad,
            "subtotal": float(producto.precio_venta) * data.cantidad,
            "id_almacen": id_almacen
        })

    recalcular_total_mesa(mesa)
    redis_pos.setex(key, TTL_MESA, json.dumps(mesa))
    return mesa

# -------------------------------------------------
# Agregar recarga a mesa
# -------------------------------------------------
@router.post("/mesas/{id_mesa}/recarga")
def agregar_recarga(id_mesa: int, data: POSAgregarDistinto):
    key = f"pos:mesa:{id_mesa}"
    mesa_data = redis_pos.get(key)

    mesa = json.loads(mesa_data) if mesa_data else {
        "id_mesa": id_mesa,
        "estado": "abierta",
        "fecha_creacion": datetime.now().isoformat(),
        "productos": [],
        "recargas": [],
        "chance": [],
        "seq_recarga": 1,
        "seq_chance": 1,
        "total": 0
    }

    mesa.setdefault("seq_recarga", 1)

    mesa["recargas"].append({
        "id_recarga": mesa["seq_recarga"],
        "valor": data.valor
    })

    mesa["seq_recarga"] += 1

    recalcular_total_mesa(mesa)
    redis_pos.setex(key, TTL_MESA, json.dumps(mesa))
    return mesa

# -------------------------------------------------
# Agregar chance a mesa
# -------------------------------------------------
@router.post("/mesas/{id_mesa}/chance")
def agregar_chance(id_mesa: int, data: POSAgregarDistinto):
    key = f"pos:mesa:{id_mesa}"
    mesa_data = redis_pos.get(key)

    mesa = json.loads(mesa_data) if mesa_data else {
        "id_mesa": id_mesa,
        "estado": "abierta",
        "fecha_creacion": datetime.now().isoformat(),
        "productos": [],
        "recargas": [],
        "chance": [],
        "seq_recarga": 1,
        "seq_chance": 1,
        "total": 0
    }

    mesa.setdefault("seq_chance", 1)

    mesa["chance"].append({
        "id_chance": mesa["seq_chance"],
        "valor": data.valor
    })

    mesa["seq_chance"] += 1

    recalcular_total_mesa(mesa)
    redis_pos.setex(key, TTL_MESA, json.dumps(mesa))
    return mesa

# -------------------------------------------------
# Editar recarga o chance
# -------------------------------------------------
@router.put("/mesas/{id_mesa}/editar-distinto")
def editar_recarga_o_chance(id_mesa: int, data: POSEditarDistinto):
    key = f"pos:mesa:{id_mesa}"
    mesa_data = redis_pos.get(key)

    if not mesa_data:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    mesa = json.loads(mesa_data)

    if mesa.get("estado") == "cerrada":
        raise HTTPException(status_code=400, detail="La mesa ya está cerrada")

    if data.tipo == "recarga":
        lista = mesa.get("recargas", [])
        id_buscar = data.id_recarga
        campo_id = "id_recarga"
    else:
        lista = mesa.get("chance", [])
        id_buscar = data.id_chance
        campo_id = "id_chance"

    if not id_buscar:
        raise HTTPException(
            status_code=400,
            detail=f"Debe enviar {campo_id}"
        )

    item = next((x for x in lista if x[campo_id] == id_buscar), None)

    if not item:
        raise HTTPException(
            status_code=404,
            detail=f"{data.tipo.capitalize()} no encontrada"
        )

    # eliminar
    if data.valor <= 0:
        lista.remove(item)
    else:
        item["valor"] = data.valor

    recalcular_total_mesa(mesa)
    redis_pos.setex(key, TTL_MESA, json.dumps(mesa))
    return mesa

# -------------------------------------------------
# Editar producto (cantidad / eliminar)
# -------------------------------------------------
@router.put("/mesas/{id_mesa}/editar")
def editar_producto(
    id_mesa: int,
    data: POSEditarProducto,
    db: Session = Depends(get_db)
):
    key = f"pos:mesa:{id_mesa}"
    mesa_data = redis_pos.get(key)

    if not mesa_data:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")

    mesa = json.loads(mesa_data)

    if mesa.get("estado") == "cerrada":
        raise HTTPException(status_code=400, detail="La mesa ya está cerrada")

    nuevos_productos = []
    producto_encontrado = False

    for p in mesa["productos"]:
        if p["id_producto"] == data.id_producto:
            producto_encontrado = True

            if data.cantidad <= 0:
                # eliminar producto
                continue

            # Determinar almacén destino
            id_almacen_destino = data.id_almacen or p["id_almacen"]

            # Validar stock en el almacén destino
            validar_stock(
                db,
                p["id_producto"],
                data.cantidad,
                id_almacen_destino
            )

            # Actualizar producto
            p["cantidad"] = data.cantidad
            p["id_almacen"] = id_almacen_destino
            p["subtotal"] = p["cantidad"] * p["precio_unitario"]

            nuevos_productos.append(p)
        else:
            nuevos_productos.append(p)

    if not producto_encontrado:
        raise HTTPException(status_code=404, detail="Producto no existe en la mesa")

    mesa["productos"] = nuevos_productos
    recalcular_total_mesa(mesa)

    redis_pos.setex(key, TTL_MESA, json.dumps(mesa))
    return mesa

# -------------------------------------------------
# Cerrar mesa (venta o deuda)
# -------------------------------------------------
@router.post(
    "/mesas/{id_mesa}/cerrar",
    response_model=POSCerrarMesaResponse
)
def cerrar_mesa(
    id_mesa: int,
    data: POSCerrarMesa,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    key = f"pos:mesa:{id_mesa}"
    mesa_data = redis_pos.get(key)

    if not mesa_data:
        raise HTTPException(status_code=404, detail="Mesa no existe")

    mesa = json.loads(mesa_data)

    if mesa.get("estado") == "cerrada":
        raise HTTPException(status_code=400, detail="La mesa ya fue cerrada")

    fecha_cierre = datetime.now()
    totales = calcular_totales_por_caja(mesa)

    # =================================================
    # VENTA
    # =================================================
    if data.tipo == "venta":

        venta = Venta(
            id_usuario=current_user.id_usuario,
            id_caja=CAJA_PRODUCTOS,
            fecha_venta=fecha_cierre,
            total=totales["productos"],
            estado="pagada",
            observaciones=data.observaciones
        )
        db.add(venta)

        descontar_stock(db, mesa["productos"])

        db.commit()
        db.refresh(venta)

        for p in mesa["productos"]:
            db.add(DetalleVenta(
                id_venta=venta.id_venta,
                id_producto=p["id_producto"],
                cantidad=p["cantidad"],
                precio_unitario=p["precio_unitario"]
            ))

        total_pagado = 0
        for pago in (data.pagos or []):
            total_pagado += pago.monto
            db.add(PagoVenta(
                id_venta=venta.id_venta,
                id_metodo=pago.id_metodo,
                monto=pago.monto
            ))

        if total_pagado < totales["productos"]:
            raise HTTPException(
                status_code=400,
                detail="El monto pagado no cubre el total de productos"
            )

        # 🏦 AFECTAR CAJAS
        if totales["productos"] > 0:
            caja = db.query(Caja).filter(Caja.id_caja == CAJA_PRODUCTOS).first()
            caja.saldo_actual += Decimal(str(totales["productos"]))

        if totales["recargas"] > 0:
            caja = db.query(Caja).filter(Caja.id_caja == CAJA_RECARGAS).first()
            caja.saldo_actual += Decimal(str(totales["recargas"]))

        if totales["chance"] > 0:
            caja = db.query(Caja).filter(Caja.id_caja == CAJA_CHANCE).first()
            caja.saldo_actual += Decimal(str(totales["chance"]))

        mesa["estado"] = "cerrada"

        # 📦 Movimientos de inventario (SALIDA por venta)
        for p in mesa["productos"]:
            registrar_movimiento_inventario(
                db=db,
                id_producto=p["id_producto"],
                tipo="salida",
                cantidad=p["cantidad"],
                id_usuario=current_user.id_usuario,
                motivo=f"Venta exitosa {venta.id_venta}",
                id_almacen_origen=p["id_almacen"]
            )
        descripcion=(
                f"Venta exitosa {venta.id_venta} "
                f"Total: {totales['productos']}"
            )

        registrar_log(
            db=db,
            id_usuario=current_user.id_usuario,
            accion="Venta POS",
            descripcion=descripcion,
            tabla="ventas"
        )

        db.commit()
        redis_pos.delete(key)

        total_venta = sum(totales.values())
        vueltas = float(total_pagado - total_venta)

        return POSCerrarMesaResponse(
            id_mesa=id_mesa,
            tipo="venta",
            id_registro=venta.id_venta,
            total=float(sum(totales.values())),
            caja_afectada=CAJA_PRODUCTOS,
            fecha=fecha_cierre,
            cajas=totales,
            vueltas=vueltas
        )

    # =================================================
    # DEUDA
    # =================================================
    if data.tipo == "deuda":

        if not data.id_usuario_deuda:
            raise HTTPException(
                status_code=400,
                detail="Debe asignar un usuario a la deuda"
            )

        deuda = Deuda(
            id_usuario=data.id_usuario_deuda,
            total=totales["productos"],
            estado="pendiente",
            observaciones=data.observaciones
        )
        db.add(deuda)

        descontar_stock(db, mesa["productos"])

        db.commit()
        db.refresh(deuda)

        for p in mesa["productos"]:
            db.add(DetalleDeuda(
                id_deuda=deuda.id_deuda,
                id_producto=p["id_producto"],
                cantidad=p["cantidad"],
                precio_unitario=p["precio_unitario"]
            ))

        usuario_deuda = db.query(Usuario).filter(
            Usuario.id_usuario == data.id_usuario_deuda
        ).first()

        # 📦 Movimientos de inventario (SALIDA por deuda)
        for p in mesa["productos"]:
            registrar_movimiento_inventario(
                db=db,
                id_producto=p["id_producto"],
                tipo="salida",
                cantidad=p["cantidad"],
                id_usuario=current_user.id_usuario,
                motivo=f"Deuda registrada {deuda.id_deuda}",
                id_almacen_origen=p["id_almacen"]
            )

        descripcion=(
            f"Deuda registrada {deuda.id_deuda} "
            f"{usuario_deuda.nombre} "
            f"${totales['productos']}"
        )

        registrar_log(
            db=db,
            id_usuario=current_user.id_usuario,
            accion="Crear deuda",
            descripcion=descripcion,
            tabla="deudas"
        )

        mesa["estado"] = "cerrada"
        db.commit()
        redis_pos.delete(key)

        return POSCerrarMesaResponse(
            id_mesa=id_mesa,
            tipo="deuda",
            id_registro=deuda.id_deuda,
            total=float(totales["productos"]),
            caja_afectada=None,
            cajas=totales,
            fecha=fecha_cierre
        )

    # =================================================
    # MESA CANCELADA
    # =================================================
    if data.tipo == "cancelada":
        redis_pos.delete(key)
        return POSCerrarMesaResponse(
            id_mesa=id_mesa,
            tipo="cancelada",
            id_registro=None,
            total=0,
            cajas={"productos": 0, "recargas": 0, "chance": 0},
            caja_afectada=None,
            fecha=fecha_cierre
        )

    raise HTTPException(status_code=400, detail="Tipo de cierre inválido")

# -------------------------------------------------
# LISTAR METODOS DE PAGO
# -------------------------------------------------
@router.get("/metodos-pago", response_model=list[MetodoPagoResponse])
async def listar_metodos_pago(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
    ):
    # 🔒 Validación de permisos (roles Admin/Vendedor)
    if current_user.rol not in [1, 2]:
        raise HTTPException(status_code=403, detail="No autorizado para ver los metodos de pago")

    return db.query(MetodoPago).all()