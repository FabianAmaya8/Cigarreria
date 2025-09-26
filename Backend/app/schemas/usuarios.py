from pydantic import BaseModel
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    usuario: str
    correo: Optional[str] = None
    imagen: Optional[str] = None
    rol: Optional[int] = None
    activo: Optional[bool] = True

class UsuarioCreate(UsuarioBase):
    contrasena: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[str] = None
    rol: Optional[int] = None
    activo: Optional[bool] = None

class UsuarioOut(UsuarioBase):
    id_usuario: int

    class Config:
        from_attributes = True 
