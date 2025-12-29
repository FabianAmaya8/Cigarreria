from pydantic import BaseModel
from typing import Optional, List

class InventarioBase(BaseModel):
    id_almacen: int
    id_producto: int
    stock: int

class InventarioCreate(InventarioBase):
    pass

class InventarioUpdate(BaseModel):
    stock: Optional[int] = None

# ===========================
# ✅ Respuesta de inventario con detalles de almacén y producto
# ===========================
class InventarioResponse(BaseModel):
    id_inventario: int
    id_almacen: int
    nombre_almacen: str
    id_producto: int
    nombre_producto: str
    imagen: Optional[str] = None
    codigo_barras: Optional[str] = None
    stock: int

    class Config:
        from_attributes = True

class ProductoStockResponse(BaseModel):
    id_producto: int
    nombre: str
    stock_total: int
    detalle_por_almacen: List[InventarioResponse]

    class Config:
        from_attributes = True

class TransferenciaRequest(BaseModel):
    id_producto: int
    id_almacen_origen: int
    id_almacen_destino: int
    cantidad: int