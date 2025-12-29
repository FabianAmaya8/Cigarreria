from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from decimal import Decimal
from app.database import get_db
from app.core.security import get_current_user
from app.utils.registrar_logs import registrar_log
from app.models.deudas import Deuda
from app.models.usuarios import Usuario
from app.models.cajas import Caja
from app.models.pagos_venta import PagoVenta
from app.models.productos import Producto
from app.models.detalle_deuda import DetalleDeuda
from app.schemas.deudas import (
    DeudaResponseWithUser, DeudaDetalleResponse, 
    DetalleDeudaResponse, ProductoResponse,
    PagoDeudaCreate, PagoDeudaResponse
)

router = APIRouter(
    prefix="/api/deudas",
    tags=["Deudas"]
)

CAJA_PRINCIPAL_ID = 1

# Listar todas las deudas (con nombre y usuario)
@router.get("/", response_model=List[DeudaResponseWithUser])
def listar_deudas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    deudas = (
        db.query(Deuda, Usuario.nombre, Usuario.usuario)
        .join(Usuario, Usuario.id_usuario == Deuda.id_usuario)
        .filter(Deuda.estado.in_(["pendiente", "parcial"]))
        .all()
    )

    if not deudas:
        raise HTTPException(status_code=404, detail="No hay deudas pendientes")

    # 🔒 Validación de permisos (solo dueño o roles Admin/Vendedor)
    if deudas[0].Deuda.id_usuario != current_user.id_usuario and current_user.rol not in [1, 2]:
        raise HTTPException(status_code=403, detail="No autorizado para ver estas deudas")

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
def obtener_deudas_usuario(
    id_usuario: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    deudas = (
        db.query(Deuda, Usuario.nombre, Usuario.usuario)
        .join(Usuario, Usuario.id_usuario == Deuda.id_usuario)
        .filter(
            Deuda.id_usuario == id_usuario,
            Deuda.estado.in_(["pendiente", "parcial"])
        )
        .all()
    )
    if not deudas:
        raise HTTPException(status_code=202, detail="No se encontraron deudas para este usuario")
    
    # 🔒 Validación de permisos (solo dueño o roles Admin/Vendedor)
    if deudas[0].Deuda.id_usuario != current_user.id_usuario and current_user.rol not in [1, 2]:
        raise HTTPException(status_code=403, detail="No autorizado para ver estas deudas")

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

# Pagar deuda
@router.post("/{id_deuda}/pagar", response_model=PagoDeudaResponse)
def pagar_deuda(
    id_deuda: int,
    data: PagoDeudaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    vueltas = 0
    deuda = db.query(Deuda).filter(Deuda.id_deuda == id_deuda).first()

    if not deuda:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    # 🔒 Validación de permisos (soloroles Admin/Vendedor)
    if current_user.rol not in [1, 2]:
        raise HTTPException(status_code=403, detail="No autorizado para pagar deudas")

    if deuda.estado == "pagada":
        raise HTTPException(status_code=400, detail="La deuda ya está pagada")

    if data.monto <= 0:
        raise HTTPException(status_code=400, detail="El monto debe ser mayor a 0")

    saldo_actual = Decimal(str(deuda.total))
    monto_pagado = Decimal(str(data.monto))

    if monto_pagado > saldo_actual:
        vueltas = monto_pagado - saldo_actual
        monto_pagado = saldo_actual

    # -----------------------------
    # Registrar pago (pagos_venta)
    # -----------------------------
    db.add(PagoVenta(
        id_venta=None,  # Pago de deuda
        id_metodo=data.id_metodo,
        monto=monto_pagado
    ))

    # -----------------------------
    # Afectar caja principal
    # -----------------------------
    caja = db.query(Caja).filter(Caja.id_caja == CAJA_PRINCIPAL_ID).first()
    if not caja:
        raise HTTPException(status_code=500, detail="Caja principal no encontrada")

    caja.saldo_actual += monto_pagado

    # -----------------------------
    # Actualizar deuda
    # -----------------------------
    nuevo_saldo = saldo_actual - monto_pagado
    deuda.total = nuevo_saldo
    deuda.estado = "pagada" if nuevo_saldo == 0 else "parcial"

    descripcion = (
        f"El usuario {current_user.nombre} "
        f"registró un pago de ${monto_pagado} "
        f"a la deuda ID {deuda.id_deuda} "
        f"estado {deuda.estado}"
    )

    registrar_log(
        db=db,
        id_usuario=current_user.id_usuario,
        accion="Pago de deuda",
        descripcion=descripcion,
        tabla="deudas"
    )

    db.commit()

    return PagoDeudaResponse(
        id_deuda=deuda.id_deuda,
        monto_pagado=float(monto_pagado),
        saldo_restante=float(nuevo_saldo),
        estado=deuda.estado,
        fecha_pago=datetime.now(),
        vueltas=float(vueltas)
    )
