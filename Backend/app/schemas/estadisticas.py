from pydantic import BaseModel
from typing import Optional

class ProductoEstadistica(BaseModel):
    id_producto: int
    nombre: str    
    imagen: Optional[str] = None
    total_vendido: int
    ingresos: float

    class Config:
        orm_mode = True

class ProductoStock(BaseModel):
    id_producto: int
    nombre: str
    imagen: Optional[str] = None
    stock_actual: int
    stock_minimo: int

    class Config:
        orm_mode = True
