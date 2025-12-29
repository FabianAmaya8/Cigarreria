from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class POSProducto(BaseModel):
    id_producto: int
    codigo_barras: str
    nombre: str
    precio_unitario: float
    imagen: Optional[str] = None

class POSItem(BaseModel):
    producto: POSProducto
    cantidad: int
    subtotal: float

class POSOrdenMesa(BaseModel):
    id_mesa: int
    productos: List[POSItem]
    total: float
    estado: Literal["abierta", "cerrada"] = "abierta"
    fecha_creacion: Optional[datetime] = None

class POSCerrarMesaResponse(BaseModel):
    id_mesa: int
    tipo: Literal["venta", "deuda", "cancelada"]
    id_registro: int
    total: float
    caja_afectada: Optional[int] = None
    fecha: datetime
    cajas: dict[str, float]
    vueltas: Optional[float] = 0

class POSAgregarProducto(BaseModel):
    codigo_barras: str
    cantidad: int = 1
    id_almacen: Optional[int] = 2

class POSEditarProducto(BaseModel):
    id_producto: int
    cantidad: int = 1
    id_almacen: Optional[int] = None

class POSPago(BaseModel):
    id_metodo: int
    monto: float

class POSReservaItem(BaseModel):
    id_producto: int
    cantidad: int

class POSReservaMesa(BaseModel):
    id_mesa: int
    productos: List[POSReservaItem]

class POSCerrarMesa(BaseModel):
    tipo: Literal["venta", "deuda", "cancelada"]

    # comunes
    observaciones: Optional[str] = None

    # solo si es venta
    pagos: Optional[List[POSPago]] = Field(default_factory=list)

    # solo si es deuda
    id_usuario_deuda: Optional[int] = None

class POSAbonoDeuda(BaseModel):
    id_metodo: int
    monto: float
    observaciones: Optional[str] = None

class POSMesaEstado(BaseModel):
    id_mesa: int
    total: float
    cantidad_items: int
    estado: Literal["abierta", "cerrada"]

class POSAgregarDistinto(BaseModel):
    valor: float

class POSEditarDistinto(BaseModel):
    tipo: Literal["recarga", "chance"]
    id_recarga: Optional[int] = None
    id_chance: Optional[int] = None
    valor: float

class MetodoPagoResponse(BaseModel):
    id_metodo: int
    nombre: str