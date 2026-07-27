from pydantic import BaseModel
from typing import Optional, List, Dict, Literal
from datetime import datetime, date
from decimal import Decimal

# ===========================
# Bolsillo
# ===========================
class BolsilloBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    color: Optional[str] = None
    icono: Optional[str] = None

class BolsilloCreate(BolsilloBase):
    saldo_actual: Decimal = Decimal("0")

class BolsilloUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    color: Optional[str] = None
    icono: Optional[str] = None

class BolsilloResponse(BolsilloBase):
    id_bolsillo: int
    saldo_actual: Decimal
    activo: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True


# ===========================
# Movimientos
# ===========================
class MovimientoBolsilloCreate(BaseModel):
    id_bolsillo: int
    id_caja: int
    monto: Decimal
    tipo: Literal["entrada", "salida"]
    motivo: Optional[str] = None

class PagoBolsilloCreate(BaseModel):
    id_bolsillo: int
    id_caja: int
    monto: Decimal
    motivo: Optional[str] = None

class MovimientoBolsilloResponse(BaseModel):
    id_movimiento: int
    id_bolsillo: int
    nombre_bolsillo: str
    id_usuario: int
    nombre_usuario: str
    tipo: Literal["entrada", "salida", "pago"]
    monto: Decimal
    motivo: Optional[str]
    fecha: datetime

    class Config:
        from_attributes = True


# ===========================
# Cierre de Día
# ===========================
class CierreMetodoPagoResponse(BaseModel):
    id_metodo_pago: int
    nombre: str
    total: Decimal

class CierreDiaCreate(BaseModel):
    fecha: date
    cantidad_a_dejar: Decimal
    observaciones: Optional[str] = None

class CierreDiaResponse(BaseModel): 
    id_cierre: int 
    fecha: date 

    saldo_cajas: Dict[str, Decimal] 
    total_ventas: Decimal 
    total_productos: int 

    cantidad_a_dejar: Decimal
    total_enviado_bolsillos: Decimal

    metodos_pago: List[CierreMetodoPagoResponse]
    
    observaciones: Optional[str] 
    fecha_cierre: datetime 
    
    class Config: 
        from_attributes = True

# ===========================
# Caja
# ===========================

class CajaResumen(BaseModel):
    id_caja: int
    nombre: str
    saldo_actual: Decimal


# ===========================
# Venta por producto
# ===========================

class VentaProductoResumen(BaseModel):
    producto: str
    imagen: Optional[str] = None
    marca: str
    cantidad: int
    total: Decimal

# ===========================
# Venta por Marca
# ===========================

class VentaMarcaResumen(BaseModel):
    marca: str
    cantidad: int
    total: Decimal

# ===========================
# Venta por Categoria
# ===========================

class VentaCategoriaResumen(BaseModel):
    categoria: str
    cantidad: int
    total: Decimal


# ===========================
# Respuesta cierre día (rango)
# ===========================

class CierreDiaRangoResponse(BaseModel):
    desde: date
    hasta: date
    cajas: List[CajaResumen]
    ventas_por_producto: List[VentaProductoResumen]
    ventas_por_marca: List[VentaMarcaResumen]
    ventas_por_categoria: List[VentaCategoriaResumen]

    class Config:
        from_attributes = True
