from app.database import Base

from app.models.roles import Rol
from app.models.usuarios import Usuario
from app.models.categorias import Categoria
from app.models.marcas import Marca
from app.models.productos import Producto
from app.models.almacenes import Almacen
from app.models.inventario import Inventario
from app.models.proveedores import Proveedor
from app.models.proveedores_productos import ProveedorProducto
from app.models.compras import Compra
from app.models.detalle_compra import DetalleCompra
from app.models.cajas import Caja
from app.models.ventas import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.metodos_pago import MetodoPago
from app.models.pagos_venta import PagoVenta
from app.models.deudas import Deuda
from app.models.detalle_deuda import DetalleDeuda
from app.models.movimientos_inventario import MovimientoInventario
from app.models.logs import Log
from app.models.arqueos_caja import ArqueoCaja
from app.models.bolsillo import Bolsillo
from app.models.bolsilloMovimiento import BolsilloMovimiento
from app.models.cierre_dia import CierreDia
from app.models.cierre_metodos_pago import CierreMetodoPago
from app.models.pagos_compra import PagoCompra
from app.models.pago_origen import PagoOrigen
from app.models.libro_mayor import LibroMayor
from app.models.compensaciones import Compensacion
from app.models.devoluciones_compra import DevolucionCompra
from app.models.detalle_devolucion_compra import DetalleDevolucionCompra


__all__ = [
    "Rol",
    "Usuario",

    "Categoria",
    "Marca",
    "Producto",

    "Almacen",
    "Inventario",

    "Proveedor",
    "ProveedorProducto",

    "Compra",
    "DetalleCompra",

    "Caja",

    "Venta",
    "DetalleVenta",

    "MetodoPago",
    "PagoVenta",

    "Deuda",
    "DetalleDeuda",

    "MovimientoInventario",

    "Log",
    "ArqueoCaja",

    "Bolsillo",
    "BolsilloMovimiento",

    "CierreDia",
    "CierreMetodoPago",

    "PagoCompra",
    "PagoOrigen",
    "LibroMayor",
    "Compensacion",
    "DevolucionCompra",
    "DetalleDevolucionCompra",
]