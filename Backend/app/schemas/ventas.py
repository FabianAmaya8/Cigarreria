from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# -----------------------------
# DETALLES
# -----------------------------
class DetalleVentaCreate(BaseModel):
    id_producto: int
    cantidad: int
    precio_unitario: float


class DetalleVentaResponse(BaseModel):
    id_detalle_venta: int
    id_producto: int
    cantidad: int
    precio_unitario: float
    subtotal: float
    producto: Optional["ProductoResponse"] = None  # se resuelve más abajo

    class Config:
        from_attributes = True


# -----------------------------
# PAGOS
# -----------------------------
class PagoVentaCreate(BaseModel):
    id_metodo: int
    monto: float


class PagoVentaResponse(BaseModel):
    id_pago: int
    id_metodo: int
    monto: float
    metodo_nombre: Optional[str] = None

    class Config:
        from_attributes = True


# -----------------------------
# PRODUCTOS
# -----------------------------
class ProductoResponse(BaseModel):
    id_producto: int
    nombre: str
    descripcion: Optional[str]
    imagen: Optional[str]

    class Config:
        from_attributes = True


# -----------------------------
# VENTAS
# -----------------------------
class VentaCreate(BaseModel):
    id_usuario: int
    id_caja: int
    total: float
    estado: str  # 'pagada' | 'fiada' | 'pendiente'
    observaciones: Optional[str] = None
    detalles: List[DetalleVentaCreate]
    pagos: Optional[List[PagoVentaCreate]] = []


class VentaResponse(BaseModel):
    id_venta: int
    id_usuario: int
    id_caja: int
    fecha_venta: datetime
    total: float
    estado: str
    observaciones: Optional[str]

    class Config:
        from_attributes = True


class VentaResponseWithUser(VentaResponse):
    usuario_nombre: str
    usuario_usuario: str


class VentaDetalleResponse(VentaResponseWithUser):
    detalles: List[DetalleVentaResponse]
    pagos: List[PagoVentaResponse]
