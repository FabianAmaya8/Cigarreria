from app.core.security import get_current_user
from app.utils.file_storage import (
    guardar_imagen,
    eliminar_archivo,
)
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuarios import Usuario
from app.core.security import get_password_hash, verify_password, get_current_user
from app.schemas.usuario_personal import (
    UsuarioPerfilResponse,
    UsuarioPerfilUpdate,
    CambiarPassword,
    ImagenResponse
)


router = APIRouter(
    prefix="/api/perfil",
    tags=["Perfil"]
)

# ---------------------------------------------------------
# 1️⃣ Obtener información personal
# ---------------------------------------------------------
@router.get("/", response_model=UsuarioPerfilResponse)
def obtener_perfil(current_user: Usuario = Depends(get_current_user)):
    return current_user


# ---------------------------------------------------------
# 2️⃣ Actualizar datos personales
# ---------------------------------------------------------
@router.put("/datos", response_model=UsuarioPerfilResponse)
def actualizar_datos(
    datos: UsuarioPerfilUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    # Validar si el nuevo nombre de usuario ya existe
    if datos.usuario and datos.usuario != current_user.usuario:
        usuario_existente = (
            db.query(Usuario)
            .filter(Usuario.usuario == datos.usuario)
            .first()
        )

        if usuario_existente:
            raise HTTPException(
                status_code=409,
                detail="El nombre de usuario ya está en uso."
            )

    # Actualizar únicamente los campos enviados
    for key, value in datos.dict(exclude_unset=True).items():
        setattr(current_user, key, value)

    db.commit()
    db.refresh(current_user)

    return current_user


# ---------------------------------------------------------
# 3️⃣ Cambiar contraseña
# ---------------------------------------------------------
@router.put("/password")
def cambiar_password(
    datos: CambiarPassword,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if not verify_password(datos.actual, current_user.contrasena):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")

    current_user.contrasena = get_password_hash(datos.nueva)
    db.commit()
    return {"mensaje": "Contraseña actualizada correctamente"}


# ---------------------------------------------------------
# 4️⃣ Subir / cambiar imagen de perfil
# ---------------------------------------------------------
@router.put("/imagen", response_model=ImagenResponse)
async def subir_imagen(
    imagen: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    try:
        nueva_imagen = await guardar_imagen(
            imagen,
            "usuarios/avatares"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    imagen_anterior = current_user.imagen

    current_user.imagen = nueva_imagen

    db.commit()
    db.refresh(current_user)

    if imagen_anterior:
        eliminar_archivo(imagen_anterior)

    return {
        "mensaje": "Imagen actualizada correctamente",
        "imagen": nueva_imagen
    }