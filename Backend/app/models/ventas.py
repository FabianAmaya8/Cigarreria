from sqlalchemy import Column, Integer, Text, DECIMAL, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Venta(Base):
    __tablename__ = "ventas"

    id_venta = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_caja = Column(Integer, ForeignKey("cajas.id_caja"))
    fecha_venta = Column(TIMESTAMP)
    total = Column(DECIMAL(12,2))
    estado = Column(Enum("pendiente","pagada","cancelada","fiada"))
    observaciones = Column(Text)

    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")
