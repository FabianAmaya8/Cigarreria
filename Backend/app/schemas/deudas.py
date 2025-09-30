from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal , List

class ProductoResponse(BaseModel):
    id_producto: int
    nombre: str
    descripcion: Optional[str] = None
    imagen: Optional[str] = None

    class Config:
        from_attributes = True


class DetalleDeudaResponse(BaseModel):
    id_detalle_deuda: int
    id_producto: int
    cantidad: int
    precio_unitario: float
    subtotal: float
    producto: ProductoResponse

    class Config:
        from_attributes = True

class DeudaDetalleResponse(BaseModel):
    id_deuda: int
    id_usuario: int
    usuario_nombre: str
    usuario_usuario: str
    fecha: datetime
    total: float
    estado: str
    observaciones: Optional[str]
    detalles: List[DetalleDeudaResponse]

    class Config:
        from_attributes = True

class DeudaBase(BaseModel):
    id_usuario: int
    total: float
    estado: Literal["pendiente", "pagada", "parcial"] = "pendiente"
    observaciones: Optional[str] = None

class DeudaCreate(DeudaBase):
    pass

class DeudaUpdate(BaseModel):
    total: Optional[float] = None
    estado: Optional[Literal["pendiente", "pagada", "parcial"]] = None
    observaciones: Optional[str] = None

class DeudaResponse(DeudaBase):
    id_deuda: int
    fecha: datetime

    class Config:
        from_attributes = True   # (Pydantic v2)

class DeudaResponseWithUser(DeudaResponse):
    usuario_nombre: str
    usuario_usuario: str
