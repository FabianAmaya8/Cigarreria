from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.compras import Compra
from app.models.detalle_compra import DetalleCompra
from app.models.pagos_compra import PagoCompra
from app.models.productos import Producto
from app.models.proveedores import Proveedor
from app.models.proveedores_productos import ProveedorProducto
from app.models.usuarios import Usuario
from app.schemas.proveedores import (
    HistorialPrecioResponse,
    ProductoRelacionadoResponse,
    ProveedorCompraResumen,
    ProveedorCreate,
    ProveedorDetalleResponse,
    ProveedorResponse,
    ProveedorUpdate,
    ProveedorYOResponse,
)
from app.utils.registrar_logs import registrar_log

router = APIRouter(prefix="/api/proveedores", tags=["Proveedores"])


def _normalizar_nombre(nombre: str) -> str:
    return nombre.strip() if nombre else nombre


def _obtener_proveedor(db: Session, id_proveedor: int) -> Proveedor:
    proveedor = db.query(Proveedor).filter(Proveedor.id_proveedor == id_proveedor).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor


def _total_pagado_compra(db: Session, id_compra: int):
    total = (
        db.query(func.coalesce(func.sum(PagoCompra.monto), 0))
        .filter(PagoCompra.id_compra == id_compra, PagoCompra.estado == "registrado")
        .scalar()
    )
    return total or 0


def _serializar_proveedor_detalle(db: Session, proveedor: Proveedor) -> ProveedorDetalleResponse:
    productos = (
        db.query(Producto)
        .join(ProveedorProducto, ProveedorProducto.id_producto == Producto.id_producto)
        .filter(ProveedorProducto.id_proveedor == proveedor.id_proveedor)
        .order_by(Producto.nombre.asc())
        .all()
    )

    return ProveedorDetalleResponse(
        id_proveedor=proveedor.id_proveedor,
        nombre=proveedor.nombre,
        nit=proveedor.nit,
        telefono=proveedor.telefono,
        correo=proveedor.correo,
        direccion=proveedor.direccion,
        ciudad=proveedor.ciudad,
        pais=proveedor.pais,
        observaciones=proveedor.observaciones,
        activo=proveedor.activo,
        fecha_creacion=proveedor.fecha_creacion,
        productos_relacionados=[
            ProductoRelacionadoResponse(
                id_producto=producto.id_producto,
                codigo_barras=producto.codigo_barras,
                nombre=producto.nombre,
                imagen=producto.imagen,
                activo=producto.activo,
            )
            for producto in productos
        ],
    )


@router.get("/yo", response_model=ProveedorYOResponse)
def obtener_proveedor_yo(db: Session = Depends(get_db)):
    proveedor = db.query(Proveedor).filter(func.upper(Proveedor.nombre) == "YO").first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor YO no encontrado")
    return proveedor


@router.get("/", response_model=List[ProveedorResponse])
def listar_proveedores(
    buscar: Optional[str] = Query(None),
    activo: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Proveedor)
    if buscar:
        termino = f"%{buscar.strip()}%"
        query = query.filter(
            or_(
                Proveedor.nombre.ilike(termino),
                Proveedor.nit.ilike(termino),
                Proveedor.correo.ilike(termino),
                Proveedor.telefono.ilike(termino),
            )
        )
    if activo is not None:
        query = query.filter(Proveedor.activo.is_(activo))
    return query.order_by(Proveedor.nombre.asc()).all()


@router.get("/{id_proveedor}", response_model=ProveedorDetalleResponse)
def obtener_proveedor(id_proveedor: int, db: Session = Depends(get_db)):
    proveedor = _obtener_proveedor(db, id_proveedor)
    return _serializar_proveedor_detalle(db, proveedor)


@router.post("/", response_model=ProveedorResponse)
def crear_proveedor(
    data: ProveedorCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    proveedor = Proveedor(
        nombre=_normalizar_nombre(data.nombre),
        nit=data.nit,
        telefono=data.telefono,
        correo=data.correo,
        direccion=data.direccion,
        ciudad=data.ciudad,
        pais=data.pais,
        observaciones=data.observaciones,
        activo=data.activo,
    )
    db.add(proveedor)
    db.flush()
    registrar_log(db, current_user.id_usuario, "Crear proveedor", f"Proveedor creado: {proveedor.nombre}", tabla="proveedores", commit=False)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.put("/{id_proveedor}", response_model=ProveedorResponse)
def actualizar_proveedor(
    id_proveedor: int,
    data: ProveedorUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    proveedor = _obtener_proveedor(db, id_proveedor)
    for campo, valor in data.dict(exclude_unset=True).items():
        if campo == "nombre" and valor is not None:
            valor = _normalizar_nombre(valor)
        setattr(proveedor, campo, valor)
    registrar_log(db, current_user.id_usuario, "Actualizar proveedor", f"Proveedor actualizado: {proveedor.nombre}", tabla="proveedores", commit=False)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.get("/{id_proveedor}/productos-relacionados", response_model=List[ProductoRelacionadoResponse])
def productos_relacionados_proveedor(id_proveedor: int, db: Session = Depends(get_db)):
    _obtener_proveedor(db, id_proveedor)
    productos = (
        db.query(Producto)
        .join(ProveedorProducto, ProveedorProducto.id_producto == Producto.id_producto)
        .filter(ProveedorProducto.id_proveedor == id_proveedor)
        .order_by(Producto.nombre.asc())
        .all()
    )
    return [
        ProductoRelacionadoResponse(
            id_producto=producto.id_producto,
            codigo_barras=producto.codigo_barras,
            nombre=producto.nombre,
            imagen=producto.imagen,
            activo=producto.activo,
        )
        for producto in productos
    ]


@router.get("/{id_proveedor}/compras", response_model=List[ProveedorCompraResumen])
def compras_proveedor(id_proveedor: int, db: Session = Depends(get_db)):
    _obtener_proveedor(db, id_proveedor)
    compras = (
        db.query(Compra)
        .filter(Compra.id_proveedor == id_proveedor)
        .order_by(Compra.fecha_pedido.desc())
        .all()
    )
    resultado = []
    for compra in compras:
        total_pagado = _total_pagado_compra(db, compra.id_compra)
        resultado.append(
            ProveedorCompraResumen(
                id_compra=compra.id_compra,
                fecha_pedido=compra.fecha_pedido,
                fecha_recepcion=compra.fecha_recepcion,
                numero_factura=compra.numero_factura,
                estado_pedido=compra.estado_pedido,
                estado_recepcion=compra.estado_recepcion,
                estado_pago=compra.estado_pago,
                total=compra.total,
                total_pagado=total_pagado,
                saldo_pendiente=compra.total - total_pagado if compra.total and total_pagado <= compra.total else 0,
            )
        )
    return resultado


@router.get("/{id_proveedor}/historial-precios", response_model=List[HistorialPrecioResponse])
def historial_precios_proveedor(id_proveedor: int, db: Session = Depends(get_db)):
    _obtener_proveedor(db, id_proveedor)
    filas = (
        db.query(
            Compra.id_compra,
            DetalleCompra.id_detalle_compra,
            DetalleCompra.id_producto,
            Producto.nombre.label("producto"),
            Compra.fecha_pedido,
            Compra.fecha_recepcion,
            DetalleCompra.precio_pedido,
            DetalleCompra.precio_recibido,
            DetalleCompra.cantidad_solicitada,
            DetalleCompra.cantidad_recibida,
            Proveedor.nombre.label("proveedor"),
        )
        .join(DetalleCompra, DetalleCompra.id_compra == Compra.id_compra)
        .join(Producto, Producto.id_producto == DetalleCompra.id_producto)
        .outerjoin(Proveedor, Proveedor.id_proveedor == Compra.id_proveedor)
        .filter(Compra.id_proveedor == id_proveedor)
        .order_by(Compra.fecha_pedido.desc())
        .all()
    )
    return [
        HistorialPrecioResponse(
            id_compra=fila.id_compra,
            id_detalle_compra=fila.id_detalle_compra,
            id_producto=fila.id_producto,
            producto=fila.producto,
            proveedor=fila.proveedor,
            fecha_pedido=fila.fecha_pedido,
            fecha_recepcion=fila.fecha_recepcion,
            precio_pedido=fila.precio_pedido,
            precio_recibido=fila.precio_recibido,
            cantidad_solicitada=fila.cantidad_solicitada,
            cantidad_recibida=fila.cantidad_recibida,
        )
        for fila in filas
    ]
