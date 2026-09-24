from datetime import date, datetime
from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel


# ===========================
# Proveedores
# ===========================
class ProveedorBase(BaseModel):
    nombre: str
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    observaciones: Optional[str] = None
    activo: bool = True


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    nit: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    observaciones: Optional[str] = None
    activo: Optional[bool] = None


class ProveedorResponse(ProveedorBase):
    id_proveedor: int
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProveedorYOResponse(ProveedorResponse):
    pass


class ProductoRelacionadoResponse(BaseModel):
    id_producto: int
    codigo_barras: str
    nombre: str
    imagen: Optional[str] = None
    activo: bool

    class Config:
        from_attributes = True


class ProveedorDetalleResponse(ProveedorResponse):
    productos_relacionados: List[ProductoRelacionadoResponse] = []


class ProveedorCompraResumen(BaseModel):
    id_compra: int
    fecha_pedido: datetime
    fecha_recepcion: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    numero_factura: Optional[str] = None
    estado_pedido: str
    estado_recepcion: str
    estado_pago: str
    total: Decimal
    total_pagado: Decimal
    saldo_pendiente: Decimal


# ===========================
# Productos en compra
# ===========================
class ProductoCompraResumen(BaseModel):
    id_producto: int
    codigo_barras: str
    nombre: str
    imagen: Optional[str] = None
    activo: bool

    class Config:
        from_attributes = True


class DetalleCompraCreate(BaseModel):
    id_producto: int
    cantidad_solicitada: int
    precio_pedido: Decimal


class DetalleCompraUpdate(BaseModel):
    id_producto: Optional[int] = None
    cantidad_solicitada: Optional[int] = None
    precio_pedido: Optional[Decimal] = None


class DetalleCompraRecepcionCreate(BaseModel):
    id_detalle_compra: int
    cantidad_recibida: int
    precio_recibido: Optional[Decimal] = None


class DetalleCompraResponse(BaseModel):
    id_detalle_compra: int
    id_producto: int
    producto: Optional[ProductoCompraResumen] = None
    cantidad_solicitada: int
    cantidad_recibida: int
    precio_pedido: Decimal
    precio_recibido: Optional[Decimal] = None
    estado: str
    subtotal_pedido: Decimal
    subtotal_recibido: Decimal

    class Config:
        from_attributes = True


# ===========================
# Compras
# ===========================
class CompraCreate(BaseModel):
    id_proveedor: Optional[int] = None
    numero_factura: Optional[str] = None
    archivo_factura: Optional[str] = None
    fecha_entrega: Optional[datetime] = None
    observaciones: Optional[str] = None
    detalles: List[DetalleCompraCreate]


class CompraUpdate(BaseModel):
    id_proveedor: Optional[int] = None
    numero_factura: Optional[str] = None
    archivo_factura: Optional[str] = None
    fecha_entrega: Optional[datetime] = None
    observaciones: Optional[str] = None
    estado_pedido: Optional[str] = None
    estado_recepcion: Optional[str] = None
    estado_pago: Optional[str] = None


class CompraResponse(BaseModel):
    id_compra: int
    proveedor: Optional[ProveedorResponse] = None
    fecha_pedido: datetime
    fecha_recepcion: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    numero_factura: Optional[str] = None
    archivo_factura: Optional[str] = None
    estado_pedido: str
    estado_recepcion: str
    estado_pago: str
    total: Decimal
    total_pagado: Decimal
    saldo_pendiente: Decimal
    observaciones: Optional[str] = None
    detalles: List[DetalleCompraResponse] = []

    class Config:
        from_attributes = True


class RecepcionCompraCreate(BaseModel):
    id_almacen_destino: Optional[int] = 2
    detalles: List[DetalleCompraRecepcionCreate]
    observaciones: Optional[str] = None


# ===========================
# Pagos de compra
# ===========================
class PagoOrigenCreate(BaseModel):
    tipo_origen: Literal["caja", "bolsillo"]
    id_origen: int
    monto: Decimal
    id_caja: Optional[int] = None
    observaciones: Optional[str] = None


class PagoCompraCreate(BaseModel):
    monto: Decimal
    origenes: List[PagoOrigenCreate]
    observaciones: Optional[str] = None


class PagoOrigenResponse(BaseModel):
    id_pago_origen: int
    tipo_origen: str
    id_origen: int
    monto: Decimal
    fecha: datetime
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True


class PagoCompraResponse(BaseModel):
    id_pago_compra: int
    id_compra: int
    id_usuario: int
    monto: Decimal
    fecha_pago: datetime
    estado: str
    observaciones: Optional[str] = None
    origenes: List[PagoOrigenResponse] = []

    class Config:
        from_attributes = True


class AnularPagoResponse(BaseModel):
    id_pago_compra: int
    estado: str
    saldo_pendiente: Decimal
    total_pagado: Decimal


# ===========================
# Devoluciones
# ===========================
class DetalleDevolucionCompraCreate(BaseModel):
    id_detalle_compra: int
    cantidad: int
    motivo: Optional[str] = None


class DevolucionCompraCreate(BaseModel):
    id_almacen: Optional[int] = 2
    motivo: Optional[str] = None
    observaciones: Optional[str] = None
    detalles: List[DetalleDevolucionCompraCreate]


class DetalleDevolucionCompraResponse(BaseModel):
    id_detalle_devolucion: int
    id_detalle_compra: int
    cantidad: int
    motivo: Optional[str] = None

    class Config:
        from_attributes = True


class DevolucionCompraResponse(BaseModel):
    id_devolucion: int
    id_compra: int
    id_usuario: int
    fecha: datetime
    estado: str
    observaciones: Optional[str] = None
    motivo: Optional[str] = None
    detalles: List[DetalleDevolucionCompraResponse] = []

    class Config:
        from_attributes = True


# ===========================
# Compensaciones
# ===========================
class CompensacionCreate(BaseModel):
    id_caja: int
    id_bolsillo: int
    monto_original: Decimal
    id_compra: Optional[int] = None
    id_pago_compra: Optional[int] = None
    observaciones: Optional[str] = None


class CompensacionResponse(BaseModel):
    id_compensacion: int
    id_caja: int
    id_bolsillo: int
    id_compra: Optional[int] = None
    id_pago_compra: Optional[int] = None
    monto_original: Decimal
    monto_compensado: Decimal
    monto_pendiente: Decimal
    estado: str
    fecha_creacion: datetime
    fecha_ultima_compensacion: Optional[datetime] = None
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True


# ===========================
# Libro mayor
# ===========================
class LibroMayorResponse(BaseModel):
    id_movimiento: int
    fecha: datetime
    tipo_movimiento: str
    origen_tipo: str
    origen_id: Optional[int] = None
    destino_tipo: str
    destino_id: Optional[int] = None
    monto: Decimal
    id_usuario: int
    id_compra: Optional[int] = None
    id_pago_compra: Optional[int] = None
    referencia_tipo: Optional[str] = None
    referencia_id: Optional[int] = None
    concepto: Optional[str] = None
    observaciones: Optional[str] = None
    estado: str

    class Config:
        from_attributes = True


# ===========================
# Reportes y alertas
# ===========================
class CompraPendientePagoResponse(BaseModel):
    id_compra: int
    proveedor: Optional[str] = None
    total: Decimal
    total_pagado: Decimal
    saldo_pendiente: Decimal
    estado_pago: str
    fecha_pedido: datetime
    numero_factura: Optional[str] = None


class HistorialPrecioResponse(BaseModel):
    id_compra: int
    id_detalle_compra: int
    id_producto: int
    producto: str
    proveedor: Optional[str] = None
    fecha_pedido: datetime
    fecha_recepcion: Optional[datetime] = None
    fecha_entrega: Optional[datetime] = None
    precio_pedido: Decimal
    precio_recibido: Optional[Decimal] = None
    cantidad_solicitada: int
    cantidad_recibida: int


class CompensacionPendienteResponse(BaseModel):
    id_compensacion: int
    caja: str
    bolsillo: str
    monto_original: Decimal
    monto_compensado: Decimal
    monto_pendiente: Decimal
    estado: str


class AlertaCompraResponse(BaseModel):
    tipo: str
    mensaje: str
    severidad: Literal["info", "warning", "error"] = "warning"
    id_compra: Optional[int] = None
    id_producto: Optional[int] = None
    id_proveedor: Optional[int] = None
