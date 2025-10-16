from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.productos import Producto
from app.models.marcas import Marca
from app.models.categorias import Categoria
from app.schemas.productos import ProductoResponse

router = APIRouter(
    prefix="/api/productos",
    tags=["Productos"]
)

# Consultar producto por código de barras
@router.get("/codigo/{codigo_barras}", response_model=ProductoResponse)
def obtener_producto_por_codigo(codigo_barras: str, db: Session = Depends(get_db)):
    producto = (
        db.query(Producto)
        .options(
            joinedload(Producto.marca).joinedload(Marca.categoria)
        )
        .filter(Producto.codigo_barras == codigo_barras)
        .first()
    )
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


# Listar todos los productos con marcas y categorías
@router.get("/", response_model=List[ProductoResponse])
def listar_productos(db: Session = Depends(get_db)):
    productos = (
        db.query(Producto)
        .options(
            joinedload(Producto.marca).joinedload(Marca.categoria)
        )
        .all()
    )
    return productos
