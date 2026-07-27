from sqlalchemy import (
    Column, Integer, String, DateTime, DECIMAL, Enum, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class BolsilloMovimiento(Base):
    __tablename__ = "bolsillo_movimientos"

    id_movimiento = Column(Integer, primary_key=True, index=True)

    id_bolsillo = Column(
        Integer,
        ForeignKey("bolsillos.id_bolsillo", ondelete="CASCADE"),
        nullable=False
    )

    id_caja = Column(
        Integer,
        ForeignKey("cajas.id_caja"),
        nullable=False
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    tipo = Column(
        Enum("entrada", "salida", "pago", name="tipo_movimiento_bolsillo"),
        nullable=False
    )

    monto = Column(DECIMAL(12, 2), nullable=False)
    motivo = Column(String(255), nullable=True)
    fecha = Column(DateTime, server_default=func.now())

    bolsillo = relationship("Bolsillo", back_populates="movimientos")
    caja = relationship("Caja")
    usuario = relationship("Usuario")

    def __repr__(self):
        return (
            f"<MovimientoBolsillo {self.tipo} "
            f"${self.monto} | Bolsillo {self.id_bolsillo}>"
        )
