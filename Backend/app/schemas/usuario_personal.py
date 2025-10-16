from pydantic import BaseModel, EmailStr, constr
from typing import Optional

# ---------------------------------------------------------
# Esquema para ver información del usuario
# ---------------------------------------------------------
class UsuarioPerfilResponse(BaseModel):
    id_usuario: int
    nombre: str
    usuario: str
    correo: EmailStr
    rol: int
    imagen: Optional[str] = None  # URL o nombre de archivo

    class Config:
        from_attributes = True  # (Pydantic v2)


# ---------------------------------------------------------
# Esquema para actualizar datos personales
# ---------------------------------------------------------
class UsuarioPerfilUpdate(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[EmailStr] = None

# ---------------------------------------------------------
# Esquema para cambiar contraseña
# ---------------------------------------------------------
class CambiarPassword(BaseModel):
    actual: constr(min_length=3)
    nueva: constr(min_length=3)


# ---------------------------------------------------------
# Esquema para respuesta de imagen
# ---------------------------------------------------------
class ImagenResponse(BaseModel):
    mensaje: str
    imagen: str
