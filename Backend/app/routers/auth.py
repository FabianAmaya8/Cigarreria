from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from app.database import get_db
from app.models.usuarios import Usuario
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.schemas.auth import UserResponse, Token
from app.core.supabase import supabase

router = APIRouter()

# --- Registro ---
@router.post("/register", response_model=UserResponse)
async def register(
    nombre: str = Form(...),
    usuario: str = Form(...),
    contrasena: str = Form(...),
    correo: str = Form(...),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    if db.query(Usuario).filter(Usuario.usuario == usuario).first():
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    if db.query(Usuario).filter(Usuario.correo == correo).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # --- Subir a Supabase ---
    image_url = None
    if imagen:
        file_bytes = await imagen.read()
        filename = f"avatars/{uuid.uuid4()}_{imagen.filename}"
        supabase.storage.from_("avatars").upload(filename, file_bytes)
        image_url = supabase.storage.from_("avatars").get_public_url(filename)

    # --- Crear usuario en BD ---
    new_user = Usuario(
        nombre=nombre,
        usuario=usuario,
        contrasena=get_password_hash(contrasena),
        rol=3,
        correo=correo,
        imagen=image_url,
        activo=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# --- Login ---
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscar por usuario o correo
    user = db.query(Usuario).filter(
        (Usuario.usuario == form_data.username) |
        (Usuario.correo == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.contrasena):
        raise HTTPException(status_code=400, detail="Credenciales inválidas")

    if not user.activo:
        raise HTTPException(status_code=403, detail="Usuario inactivo")

    # Diccionario de redirecciones según rol
    role_redirects = {
        1: "/Administrador",
        2: "/Estadisticas",
        3: "/"
    }
    destino = role_redirects.get(user.rol, "/Inicio")

    # Duración del token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"id": user.id_usuario, "rol": user.rol},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "redirect": destino
    }
