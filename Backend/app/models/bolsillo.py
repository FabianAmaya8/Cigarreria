from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, DECIMAL
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Bolsillo(Base):
    __tablename__ = "bolsillos"

    id_bolsillo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    saldo_actual = Column(DECIMAL(12, 2), nullable=False, default=0)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())

    # 🔁 Relación con movimientos
    movimientos = relationship(
        "BolsilloMovimiento",
        back_populates="bolsillo",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Bolsillo {self.nombre} | Saldo: {self.saldo_actual}>"
