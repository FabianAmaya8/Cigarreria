from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.productos import Producto
from app.models.ventas import Venta, DetalleVenta
from app.schemas.estadisticas import ProductoEstadistica, ProductoStock

router = APIRouter(
    prefix="/api/estadisticas",
    tags=["Estadísticas"]
)

# ===============================
# Productos más vendidos
# ===============================
@router.get("/mas_vendidos", response_model=List[ProductoEstadistica])
def get_productos_mas_vendidos(
    limit: int = Query(..., gt=0, description="Número de productos a mostrar"),
    db: Session = Depends(get_db)
):
    resultados = (
        db.query(
            Producto.id_producto,
            Producto.nombre,
            func.sum(DetalleVenta.cantidad).label("total_vendido"),
            func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario).label("ingresos")
        )
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .group_by(Producto.id_producto, Producto.nombre)
        .order_by(func.sum(DetalleVenta.cantidad).desc())
        .limit(limit)
        .all()
    )

    if not resultados:
        raise HTTPException(status_code=404, detail="No hay ventas registradas")

    return resultados


# ===============================
# Productos con más ingresos
# ===============================
@router.get("/mas_ingresos", response_model=List[ProductoEstadistica])
def get_productos_mas_ingresos(
    limit: int = Query(..., gt=0, description="Número de productos a mostrar"),
    db: Session = Depends(get_db)
):
    resultados = (
        db.query(
            Producto.id_producto,
            Producto.nombre,
            func.sum(DetalleVenta.cantidad).label("total_vendido"),
            func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario).label("ingresos")
        )
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .group_by(Producto.id_producto, Producto.nombre)
        .order_by(func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario).desc())
        .limit(limit)
        .all()
    )

    if not resultados:
        raise HTTPException(status_code=404, detail="No hay ingresos registrados")

    return resultados


# ===============================
# Productos con menos stock
# ===============================
@router.get("/menos_stock", response_model=List[ProductoStock])
def get_productos_menos_stock(
    limit: int = Query(..., gt=0, description="Número de productos a mostrar"),
    db: Session = Depends(get_db)
):
    productos = (
        db.query(Producto)
        .order_by(Producto.stock_actual.asc())
        .limit(limit)
        .all()
    )

    if not productos:
        raise HTTPException(status_code=404, detail="No hay productos registrados")

    return productos


# ===============================
# Productos menos vendidos
# ===============================
@router.get("/menos_vendidos", response_model=List[ProductoEstadistica])
def get_productos_menos_vendidos(
    limit: int = Query(..., gt=0, description="Número de productos a mostrar"),
    db: Session = Depends(get_db)
):
    resultados = (
        db.query(
            Producto.id_producto,
            Producto.nombre,
            func.coalesce(func.sum(DetalleVenta.cantidad), 0).label("total_vendido"),
            func.coalesce(func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario), 0).label("ingresos")
        )
        .outerjoin(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .group_by(Producto.id_producto, Producto.nombre)
        .order_by(func.coalesce(func.sum(DetalleVenta.cantidad), 0).asc())
        .limit(limit)
        .all()
    )

    if not resultados:
        raise HTTPException(status_code=404, detail="No hay productos registrados")

    return resultados
