from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Rol(Base):
    __tablename__ = "roles"

    id_rol = Column(Integer, primary_key=True, autoincrement=True)
    nombre_rol = Column(String(50), unique=True, nullable=False)

    usuarios = relationship("Usuario", back_populates="rol_rel")

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    usuario = Column(String(50), unique=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    correo = Column(String(100), unique=True)
    imagen = Column(String(255))  
    rol = Column(Integer, ForeignKey("roles.id_rol"), nullable=False, default=3)
    activo = Column(Boolean, default=True)

    rol_rel = relationship("Rol", back_populates="usuarios")
