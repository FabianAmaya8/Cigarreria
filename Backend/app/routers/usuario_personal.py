import uuid
from urllib.parse import urlparse
from app.core.security import get_current_user
from app.core.supabase import supabase
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

UPLOAD_DIR = "uploads/usuarios"

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
    if not imagen.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos de imagen (jpg, png, webp, etc.)")

    # Validar tamaño máximo (5 MB)
    file_bytes = await imagen.read()
    max_size = 5 * 1024 * 1024
    if len(file_bytes) > max_size:
        raise HTTPException(status_code=400, detail="La imagen no puede superar los 5 MB")

    filename = f"avatars/{uuid.uuid4()}_{imagen.filename}"

    # Subir nueva imagen a Supabase
    try:
        supabase.storage.from_("avatars").upload(filename, file_bytes)
        image_url = supabase.storage.from_("avatars").get_public_url(filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir la imagen: {e}")

    # Eliminar imagen anterior si existía en Supabase
    if current_user.imagen:
        try:
            # Extraer solo el path relativo desde la URL pública
            parsed_url = urlparse(current_user.imagen)
            old_path = parsed_url.path.split("/public/avatars/")[-1]
            if old_path:
                supabase.storage.from_("avatars").remove([old_path])
        except Exception as e:
            print(f"⚠️ No se pudo eliminar la imagen anterior: {e}")

    current_user.imagen = image_url
    db.commit()
    db.refresh(current_user)

    return {"mensaje": "Imagen actualizada correctamente", "imagen": image_url}
