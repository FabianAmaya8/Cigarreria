from sqlalchemy import Column, Integer, Date, DateTime, DECIMAL, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class CierreDia(Base):
    __tablename__ = "cierres_dia"

    id_cierre = Column(Integer, primary_key=True)
    fecha = Column(Date, nullable=False)
    id_caja = Column(Integer, ForeignKey("cajas.id_caja"), nullable=False)

    total_ventas = Column(DECIMAL(12,2), nullable=False)
    saldo_caja = Column(DECIMAL(12,2), nullable=False)

    cantidad_a_dejar = Column(DECIMAL(12,2), nullable=False, default=0)
    total_enviado_bolsillos = Column(DECIMAL(12,2), nullable=False, default=0)

    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_cierre = Column(DateTime, server_default=func.now())
    observaciones = Column(Text)

    metodos_pago = relationship(
        "CierreMetodoPago",
        back_populates="cierre",
        cascade="all, delete-orphan"
    )
