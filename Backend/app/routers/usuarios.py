from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuarios import Usuario
from app.schemas.usuarios import UsuarioCreate, UsuarioUpdate, UsuarioOut, UsuarioImagenResponse
from typing import List
from app.utils.security import hash_password

router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)

# Crear usuario con contraseña encriptada
@router.post("/", response_model=UsuarioOut)
def create_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = db.query(Usuario).filter(Usuario.usuario == usuario.usuario).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    hashed_pass = hash_password(usuario.contrasena)
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        usuario=usuario.usuario,
        contrasena=hashed_pass,
        imagen=usuario.imagen,
        rol=usuario.rol,
        correo=usuario.correo,
        activo=usuario.activo
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

# Listar todos los usuarios
@router.get("/", response_model=List[UsuarioOut])
def get_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()

# Obtener un usuario por ID
@router.get("/{usuario_id}", response_model=UsuarioOut)
def get_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

# Actualizar usuario (encripta si se cambia contraseña)
@router.put("/{usuario_id}", response_model=UsuarioOut)
def update_usuario(usuario_id: int, datos: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    datos_dict = datos.dict(exclude_unset=True)

    if "contrasena" in datos_dict:
        datos_dict["contrasena"] = hash_password(datos_dict["contrasena"])
    
    for key, value in datos_dict.items():
        setattr(usuario, key, value)

    db.commit()
    db.refresh(usuario)
    return usuario

# Eliminar usuario
@router.delete("/{usuario_id}")
def delete_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"detail": "Usuario eliminado correctamente"}

@router.get("/imagen/{id_usuario}", response_model=UsuarioImagenResponse)
def get_usuario_imagen(id_usuario: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario
