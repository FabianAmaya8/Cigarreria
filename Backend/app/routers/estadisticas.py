from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import Producto, DetalleVenta
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
            Producto.imagen,
            func.sum(DetalleVenta.cantidad).label("total_vendido"),
            func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario).label("ingresos")
        )
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .group_by(Producto.id_producto, Producto.nombre, Producto.imagen)
        .order_by(func.sum(DetalleVenta.cantidad).desc())
        .limit(limit)
        .all()
    )

    if not resultados:
        raise HTTPException(status_code=404, detail="No hay ventas registradas")

    return [
        ProductoEstadistica(
            id_producto=r[0],
            nombre=r[1],
            imagen=r[2],
            total_vendido=r[3],
            ingresos=float(r[4])
        )
        for r in resultados
    ]


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
            Producto.imagen,
            func.sum(DetalleVenta.cantidad).label("total_vendido"),
            func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario).label("ingresos")
        )
        .join(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .group_by(Producto.id_producto, Producto.nombre, Producto.imagen)
        .order_by(func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario).desc())
        .limit(limit)
        .all()
    )

    if not resultados:
        raise HTTPException(status_code=404, detail="No hay ingresos registrados")

    return [
        ProductoEstadistica(
            id_producto=r[0],
            nombre=r[1],
            imagen=r[2],
            total_vendido=r[3],
            ingresos=float(r[4])
        )
        for r in resultados
    ]


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

    return [
        ProductoStock(
            id_producto=p.id_producto,
            nombre=p.nombre,
            imagen=p.imagen,
            stock_actual=p.stock_actual,
            stock_minimo=p.stock_minimo
        )
        for p in productos
    ]


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
            Producto.imagen,
            func.coalesce(func.sum(DetalleVenta.cantidad), 0).label("total_vendido"),
            func.coalesce(func.sum(DetalleVenta.cantidad * DetalleVenta.precio_unitario), 0).label("ingresos")
        )
        .outerjoin(DetalleVenta, DetalleVenta.id_producto == Producto.id_producto)
        .group_by(Producto.id_producto, Producto.nombre, Producto.imagen)
        .order_by(func.coalesce(func.sum(DetalleVenta.cantidad), 0).asc())
        .limit(limit)
        .all()
    )

    if not resultados:
        raise HTTPException(status_code=404, detail="No hay productos registrados")

    return [
        ProductoEstadistica(
            id_producto=r[0],
            nombre=r[1],
            imagen=r[2],
            total_vendido=r[3],
            ingresos=float(r[4])
        )
        for r in resultados
    ]
