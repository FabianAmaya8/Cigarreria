from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    nombre: str
    usuario: str
    contrasena: str
    correo: EmailStr
    imagen: Optional[str] = None

class UserResponse(BaseModel):
    id_usuario: int
    nombre: str
    usuario: str
    correo: EmailStr
    rol: int
    activo: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    redirect: str
