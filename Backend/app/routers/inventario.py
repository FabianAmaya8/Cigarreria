from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.productos import Producto
from app.models.almacenes import Almacen
from app.models.inventario import Inventario
from app.models.usuarios import Usuario
from app.schemas.inventario import (
    InventarioCreate, InventarioUpdate,
    InventarioResponse, ProductoStockResponse, 
    TransferenciaRequest
)
from app.core.security import get_current_user
from app.utils.registrar_logs import registrar_log
from app.utils.registrar_mov_inv import registrar_movimiento_inventario

router = APIRouter(
    prefix="/api/inventario",
    tags=["Inventario"]
)

# ===========================
# 🟢 Listar todo el inventario
# ===========================
@router.get("/", response_model=List[InventarioResponse])
def listar_inventario(db: Session = Depends(get_db)):
    inventarios = db.query(Inventario).options(
        joinedload(Inventario.producto),
        joinedload(Inventario.almacen)
    ).all()

    # 🔧 Agregamos el campo nombre_almacen manualmente
    result = []
    for inv in inventarios:
        item = {
            "id_inventario": inv.id_inventario,
            "id_almacen": inv.id_almacen,
            "id_producto": inv.id_producto,
            "nombre_producto": inv.producto.nombre if inv.producto else None,
            "imagen": inv.producto.imagen if inv.producto else None,
            "codigo_barras": inv.producto.codigo_barras if inv.producto else None,
            "stock": inv.stock,
            "nombre_almacen": inv.almacen.nombre if inv.almacen else None
        }
        result.append(item)
    return result

# ===========================
# 🟢 Ver stock de un producto (sumado por almacén)
# ===========================
@router.get("/producto/{id_producto}", response_model=ProductoStockResponse)
def obtener_stock_producto(id_producto: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    inventarios = (
        db.query(
            Inventario.id_inventario, Inventario.id_almacen,
            Almacen.nombre.label("nombre_almacen"),
            Inventario.id_producto,
            Producto.nombre.label("nombre_producto"),
            Inventario.stock
        ).join(Almacen, Inventario.id_almacen == Almacen.id_almacen)
        .join(Producto, Inventario.id_producto == Producto.id_producto)
        .filter(Inventario.id_producto == id_producto).all()
    )

    stock_total = sum(i.stock for i in inventarios)
    producto.stock_actual = stock_total
    db.commit()

    return ProductoStockResponse(
        id_producto=producto.id_producto,
        nombre=producto.nombre,
        stock_total=stock_total,
        detalle_por_almacen=inventarios
    )

# ===========================
# 🔄 Transferir stock entre almacenes (ruta separada del PUT anterior)
# ===========================
@router.put("/transferir-stock")
def transferir_stock(
    data: TransferenciaRequest,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    id_producto = data.id_producto
    id_almacen_origen = data.id_almacen_origen
    id_almacen_destino = data.id_almacen_destino
    cantidad = data.cantidad

    if cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")

    producto = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    origen = db.query(Inventario).filter(
        Inventario.id_producto == id_producto,
        Inventario.id_almacen == id_almacen_origen
    ).first()
    destino = db.query(Inventario).filter(
        Inventario.id_producto == id_producto,
        Inventario.id_almacen == id_almacen_destino
    ).first()
    almacen_origen = db.query(Almacen).filter(Almacen.id_almacen == id_almacen_origen).first()
    almacen_destino = db.query(Almacen).filter(Almacen.id_almacen == id_almacen_destino).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if not origen or origen.stock < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente en el almacén origen")
    if not almacen_origen or not almacen_destino:
        raise HTTPException(status_code=404, detail="Almacén no encontrado")

    # Crear destino si no existe
    if not destino:
        destino = Inventario(id_producto=id_producto, id_almacen=id_almacen_destino, stock=0)
        db.add(destino)

    origen.stock -= cantidad
    destino.stock += cantidad
    db.commit()

    total = db.query(func.sum(Inventario.stock)).filter(
        Inventario.id_producto == id_producto
    ).scalar() or 0

    producto.stock_actual = total
    db.commit()

    # Registrar movimiento de inventario
    registrar_movimiento_inventario(
        db=db,
        id_producto=id_producto,
        tipo="transferencia",
        cantidad=cantidad,
        id_usuario=current_user.id_usuario,
        motivo="Transferencia entre almacenes",
        id_almacen_origen=id_almacen_origen,
        id_almacen_destino=id_almacen_destino
    )

    descripcion = (
        f"{producto.nombre}: {cantidad} "
        f"{almacen_origen.nombre} -> {almacen_destino.nombre}"
    )
    registrar_log(db, current_user.id_usuario, "Transferencia de stock", descripcion)

    return {"mensaje": "Transferencia realizada con éxito", "stock_total": total}

# ===========================
# 🟡 Actualizar stock en un almacén (con log + token)
# ===========================
@router.put("/{id_inventario}", response_model=InventarioResponse)
def actualizar_stock(
    id_inventario: int,
    data: InventarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    inventario = (
        db.query(
            Inventario.id_inventario,
            Inventario.id_almacen,
            Almacen.nombre.label("nombre_almacen"),
            Inventario.id_producto,
            Producto.nombre.label("nombre_producto"),
            Inventario.stock
        )
        .join(Almacen, Inventario.id_almacen == Almacen.id_almacen)
        .join(Producto, Inventario.id_producto == Producto.id_producto)
        .filter(Inventario.id_inventario == id_inventario)
        .first()
    )
    if not inventario:
        raise HTTPException(status_code=404, detail="Registro de inventario no encontrado")

    inventario_obj = db.query(Inventario).filter_by(id_inventario=id_inventario).first()
    if data.stock is not None:
        inventario_obj.stock = data.stock

    db.commit()
    db.refresh(inventario_obj)

    # Actualizar stock total
    stock_total = db.query(func.sum(Inventario.stock)).filter(
        Inventario.id_producto == inventario.id_producto
    ).scalar() or 0

    producto = db.query(Producto).filter(Producto.id_producto == inventario.id_producto).first()
    producto.stock_actual = stock_total
    db.commit()

    diferencia = data.stock - inventario.stock

    # 📦 Movimiento de inventario (AJUSTE)
    registrar_movimiento_inventario(
        db=db,
        id_producto=inventario.id_producto,
        tipo="ajuste",
        cantidad=diferencia,
        id_usuario=current_user.id_usuario,
        motivo="Ajuste manual de inventario",
        id_almacen_origen=inventario.id_almacen
    )

    # 🧾 Log detallado
    descripcion = (
        f"{inventario.nombre_producto} "
        f"{inventario.nombre_almacen}: {inventario.stock} -> {data.stock}"
    )
    registrar_log(db, current_user.id_usuario, "Actualización de stock", descripcion)

    return inventario

# ===========================
# 🟢 Crear nuevo registro en inventario
# ===========================
@router.post("/", response_model=InventarioResponse)
def crear_inventario(
    data: InventarioCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    producto = db.query(Producto).filter(Producto.id_producto == data.id_producto).first()
    almacen = db.query(Almacen).filter(Almacen.id_almacen == data.id_almacen).first()

    if not producto:
        raise HTTPException(status_code=400, detail="Producto no válido")
    if not almacen:
        raise HTTPException(status_code=400, detail="Almacén no válido")

    existente = db.query(Inventario).filter(
        Inventario.id_producto == data.id_producto,
        Inventario.id_almacen == data.id_almacen,
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un inventario para ese producto en este almacén")

    nuevo = Inventario(**data.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    # 📦 Movimiento de inventario (ENTRADA)
    if nuevo.stock > 0:
        registrar_movimiento_inventario(
            db=db,
            id_producto=nuevo.id_producto,
            tipo="entrada",
            cantidad=nuevo.stock,
            id_usuario=current_user.id_usuario,
            motivo="Stock inicial",
            id_almacen_destino=nuevo.id_almacen
        )

        registrar_log(
            db=db,
            id_usuario=1,
            accion="Stock inicial",
            descripcion=f"{producto.nombre}: {almacen.nombre} -> {nuevo.stock}",
            tabla="inventario"
        )


    stock_total = db.query(func.sum(Inventario.stock)).filter(
        Inventario.id_producto == data.id_producto
    ).scalar() or 0

    producto.stock_actual = stock_total
    db.commit()

    respuesta = {
        "id_inventario": nuevo.id_inventario,
        "id_almacen": nuevo.id_almacen,
        "id_producto": nuevo.id_producto,
        "nombre_producto": producto.nombre,
        "stock": nuevo.stock,
        "nombre_almacen": almacen.nombre
    }

    return respuesta
