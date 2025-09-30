from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    usuario = Column(String(50), unique=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    imagen = Column(String(255))
    rol = Column(Integer, ForeignKey("roles.id_rol"))
    activo = Column(Boolean, default=True)

    rol_rel = relationship("Rol", back_populates="usuarios")
    deudas = relationship("Deuda", back_populates="usuario")
