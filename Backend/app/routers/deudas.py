from fastapi import APIRouter, Depends, HTTPException
from app.core.security import get_current_user
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.deudas import Deuda
from app.models.productos import Producto
from app.models.detalle_deuda import DetalleDeuda
from app.models.usuarios import Usuario
from app.schemas.deudas import (
    DeudaCreate, DeudaUpdate, DeudaResponse, 
    DeudaResponseWithUser, DeudaDetalleResponse, 
    DetalleDeudaResponse, ProductoResponse
)

router = APIRouter(
    prefix="/api/deudas",
    tags=["Deudas"]
)

# Crear una deuda
@router.post("/", response_model=DeudaResponse)
def crear_deuda(deuda: DeudaCreate, db: Session = Depends(get_db)):
    nueva_deuda = Deuda(**deuda.dict())
    db.add(nueva_deuda)
    db.commit()
    db.refresh(nueva_deuda)
    return nueva_deuda


# Listar todas las deudas (con nombre y usuario)
@router.get("/", response_model=List[DeudaResponseWithUser])
def listar_deudas(db: Session = Depends(get_db)):
    deudas = (
        db.query(Deuda, Usuario.nombre, Usuario.usuario)
        .join(Usuario, Usuario.id_usuario == Deuda.id_usuario)
        .all()
    )

    return [
        DeudaResponseWithUser(
            id_deuda=d.Deuda.id_deuda,
            id_usuario=d.Deuda.id_usuario,
            usuario_nombre=d.nombre,
            usuario_usuario=d.usuario,
            fecha=d.Deuda.fecha,
            total=d.Deuda.total,
            estado=d.Deuda.estado,
            observaciones=d.Deuda.observaciones
        )
        for d in deudas
    ]


# Consultar deuda por ID (con nombre y usuario)
@router.get("/usuario/{id_usuario}", response_model=List[DeudaResponseWithUser])
def obtener_deudas_usuario(id_usuario: int, db: Session = Depends(get_db)):
    deudas = (
        db.query(Deuda, Usuario.nombre, Usuario.usuario)
        .join(Usuario, Usuario.id_usuario == Deuda.id_usuario)
        .filter(Deuda.id_usuario == id_usuario)
        .all()
    )
    if not deudas:
        raise HTTPException(status_code=202, detail="No se encontraron deudas para este usuario")

    return [
        DeudaResponseWithUser(
            id_deuda=d.Deuda.id_deuda,
            id_usuario=d.Deuda.id_usuario,
            usuario_nombre=d.nombre,
            usuario_usuario=d.usuario,
            fecha=d.Deuda.fecha,
            total=d.Deuda.total,
            estado=d.Deuda.estado,
            observaciones=d.Deuda.observaciones
        )
        for d in deudas
    ]

# Modificar deuda
@router.put("/{id_deuda}", response_model=DeudaResponse)
def actualizar_deuda(id_deuda: int, deuda_update: DeudaUpdate, db: Session = Depends(get_db)):
    deuda = db.query(Deuda).filter(Deuda.id_deuda == id_deuda).first()
    if not deuda:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")

    for key, value in deuda_update.dict(exclude_unset=True).items():
        setattr(deuda, key, value)

    db.commit()
    db.refresh(deuda)
    return deuda

# Endpoint para obtener deuda + detalles
@router.get("/{id_deuda}/detalles", response_model=DeudaDetalleResponse)
def obtener_detalles_deuda(
    id_deuda: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    deuda = (
        db.query(Deuda, Usuario.nombre, Usuario.usuario)
        .join(Usuario, Usuario.id_usuario == Deuda.id_usuario)
        .filter(Deuda.id_deuda == id_deuda)
        .first()
    )

    if not deuda:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")

    # 🔒 Validación de permisos
    if deuda.Deuda.id_usuario != current_user.id_usuario and current_user.rol not in [1, 2]:
        raise HTTPException(status_code=403, detail="No autorizado para ver esta deuda")

    # 👇 Join con productos
    detalles = (
        db.query(DetalleDeuda, Producto)
        .join(Producto, Producto.id_producto == DetalleDeuda.id_producto)
        .filter(DetalleDeuda.id_deuda == id_deuda)
        .all()
    )

    return DeudaDetalleResponse(
        id_deuda=deuda.Deuda.id_deuda,
        id_usuario=deuda.Deuda.id_usuario,
        usuario_nombre=deuda.nombre,
        usuario_usuario=deuda.usuario,
        fecha=deuda.Deuda.fecha,
        total=deuda.Deuda.total,
        estado=deuda.Deuda.estado,
        observaciones=deuda.Deuda.observaciones,
        detalles=[
            DetalleDeudaResponse(
                id_detalle_deuda=d.DetalleDeuda.id_detalle_deuda,
                id_producto=d.DetalleDeuda.id_producto,
                cantidad=d.DetalleDeuda.cantidad,
                precio_unitario=d.DetalleDeuda.precio_unitario,
                subtotal=d.DetalleDeuda.subtotal,
                producto=ProductoResponse(
                    id_producto=d.Producto.id_producto,
                    nombre=d.Producto.nombre,
                    descripcion=d.Producto.descripcion,
                    imagen=d.Producto.imagen
                )
            )
            for d in detalles
        ]
    )
