from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

# Definimos un Enum de Python para mapear con la BD
class EstadoDeuda(str, enum.Enum):
    pendiente = "pendiente"
    pagada = "pagada"
    parcial = "parcial"

class Deuda(Base):
    __tablename__ = "deudas"

    id_deuda = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)
    total = Column(Float, nullable=False)
    estado = Column(Enum(EstadoDeuda), default=EstadoDeuda.pendiente, nullable=False)
    observaciones = Column(Text)

    usuario = relationship("Usuario", back_populates="deudas")