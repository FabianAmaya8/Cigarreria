from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.security import get_current_user
from app.database import get_db
from app.models.ventas import Venta
from app.models.detalle_venta import DetalleVenta
from app.models.usuarios import Usuario
from app.models.productos import Producto
from app.models.pagos_venta import PagoVenta
from app.models.metodos_pago import MetodoPago
from app.models.cajas import Caja
from app.schemas.ventas import (
    VentaCreate, VentaResponse, VentaResponseWithUser,
    VentaDetalleResponse, DetalleVentaResponse,
    PagoVentaResponse, ProductoResponse
)

router = APIRouter(
    prefix="/api/ventas",
    tags=["Ventas"]
)

# Crear una venta
@router.post("/", response_model=VentaResponse)
def crear_venta(venta: VentaCreate, db: Session = Depends(get_db)):
    nueva_venta = Venta(
        id_usuario=venta.id_usuario,
        id_caja=venta.id_caja,
        total=venta.total,
        estado=venta.estado,
        observaciones=venta.observaciones
    )
    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)

    # Insertar detalles
    for det in venta.detalles:
        db.add(DetalleVenta(
            id_venta=nueva_venta.id_venta,
            id_producto=det.id_producto,
            cantidad=det.cantidad,
            precio_unitario=det.precio_unitario
        ))

    # Insertar pagos (si aplica)
    if venta.pagos:
        for pago in venta.pagos:
            db.add(PagoVenta(
                id_venta=nueva_venta.id_venta,
                id_metodo=pago.id_metodo,
                monto=pago.monto
            ))

        # actualizar saldo caja
        caja = db.query(Caja).filter(Caja.id_caja == venta.id_caja).first()
        if caja:
            caja.saldo_actual += venta.total

    db.commit()
    return nueva_venta


# Listar todas las ventas con usuario
@router.get("/", response_model=List[VentaResponseWithUser])
def listar_ventas(db: Session = Depends(get_db)):
    ventas = (
        db.query(Venta, Usuario.nombre, Usuario.usuario)
        .join(Usuario, Usuario.id_usuario == Venta.id_usuario)
        .all()
    )

    return [
        VentaResponseWithUser(
            id_venta=v.Venta.id_venta,
            id_usuario=v.Venta.id_usuario,
            id_caja=v.Venta.id_caja,
            usuario_nombre=v.nombre,
            usuario_usuario=v.usuario,
            fecha_venta=v.Venta.fecha_venta,
            total=v.Venta.total,
            estado=v.Venta.estado,
            observaciones=v.Venta.observaciones
        )
        for v in ventas
    ]


# Consultar venta con detalles y pagos
@router.get("/{id_venta}/detalles", response_model=VentaDetalleResponse)
def obtener_detalles_venta(
    id_venta: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    venta = (
        db.query(Venta, Usuario.nombre, Usuario.usuario)
        .join(Usuario, Usuario.id_usuario == Venta.id_usuario)
        .filter(Venta.id_venta == id_venta)
        .first()
    )

    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")

    # 🔒 Validación de permisos (solo dueño o roles Admin/Vendedor)
    if venta.Venta.id_usuario != current_user.id_usuario and current_user.rol not in [1, 2]:
        raise HTTPException(status_code=403, detail="No autorizado para ver esta venta")

    # Obtener detalles
    detalles = (
        db.query(DetalleVenta, Producto)
        .join(Producto, Producto.id_producto == DetalleVenta.id_producto)
        .filter(DetalleVenta.id_venta == id_venta)
        .all()
    )

    # Obtener pagos
    pagos = (
        db.query(PagoVenta, MetodoPago)
        .join(MetodoPago, MetodoPago.id_metodo == PagoVenta.id_metodo)
        .filter(PagoVenta.id_venta == id_venta)
        .all()
    )

    return VentaDetalleResponse(
        id_venta=venta.Venta.id_venta,
        id_usuario=venta.Venta.id_usuario,
        id_caja=venta.Venta.id_caja,
        usuario_nombre=venta.nombre,
        usuario_usuario=venta.usuario,
        fecha_venta=venta.Venta.fecha_venta,
        total=venta.Venta.total,
        estado=venta.Venta.estado,
        observaciones=venta.Venta.observaciones,
        detalles=[
            DetalleVentaResponse(
                id_detalle_venta=d.DetalleVenta.id_detalle_venta,
                id_producto=d.DetalleVenta.id_producto,
                cantidad=d.DetalleVenta.cantidad,
                precio_unitario=d.DetalleVenta.precio_unitario,
                subtotal=d.DetalleVenta.subtotal,
                producto=ProductoResponse(
                    id_producto=d.Producto.id_producto,
                    nombre=d.Producto.nombre,
                    descripcion=d.Producto.descripcion,
                    imagen=d.Producto.imagen
                )
            )
            for d in detalles
        ],
        pagos=[
            PagoVentaResponse(
                id_pago=p.PagoVenta.id_pago,
                id_metodo=p.PagoVenta.id_metodo,
                monto=p.PagoVenta.monto,
                metodo_nombre=p.MetodoPago.nombre
            )
            for p in pagos
        ]
    )
