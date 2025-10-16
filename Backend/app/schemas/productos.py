from pydantic import BaseModel
from typing import Optional


class CategoriaResponse(BaseModel):
    id_categoria: int
    nombre: str

    class Config:
        from_attributes = True


class MarcaResponse(BaseModel):
    id_marca: int
    nombre: str
    categoria: Optional[CategoriaResponse] = None

    class Config:
        from_attributes = True


class ProductoResponse(BaseModel):
    id_producto: int
    codigo_barras: str
    nombre: str
    descripcion: Optional[str] = None
    imagen: Optional[str] = None
    precio_venta: float
    stock_actual: int
    marca: Optional[MarcaResponse] = None

    class Config:
        from_attributes = True
