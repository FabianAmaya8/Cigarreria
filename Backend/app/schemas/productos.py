from pydantic import BaseModel
from typing import Optional

# ===========================
# Categorías
# ===========================
class CategoriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class CategoriaResponse(CategoriaBase):
    id_categoria: int

    class Config:
        from_attributes = True


# ===========================
# Marcas
# ===========================
class MarcaBase(BaseModel):
    nombre: str
    id_categoria: int


class MarcaCreate(MarcaBase):
    pass


class MarcaUpdate(BaseModel):
    nombre: Optional[str] = None
    id_categoria: Optional[int] = None


class MarcaResponse(BaseModel):
    id_marca: int
    nombre: str
    categoria: Optional[CategoriaResponse] = None

    class Config:
        from_attributes = True


# ===========================
# Productos
# ===========================
class ProductoBase(BaseModel):
    codigo_barras: str
    nombre: str
    descripcion: Optional[str] = None
    imagen: Optional[str] = None
    precio_compra: float
    precio_venta: float
    stock_actual: int
    stock_minimo: int
    unidad_medida: str
    activo: bool = True
    id_marca: int


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    codigo_barras: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    imagen: Optional[str] = None
    precio_compra: Optional[float] = None
    precio_venta: Optional[float] = None
    stock_actual: Optional[int] = None
    stock_minimo: Optional[int] = None
    unidad_medida: Optional[str] = None
    activo: Optional[bool] = None
    id_marca: Optional[int] = None


class ProductoResponse(BaseModel):
    id_producto: int
    codigo_barras: str
    nombre: str
    imagen: Optional[str]
    descripcion: Optional[str]
    precio_compra: float
    precio_venta: float
    stock_actual: int
    stock_minimo: int
    unidad_medida: str
    activo: bool
    id_marca: int
    marca: Optional[MarcaResponse]

    class Config:
        from_attributes = True
