from sqlalchemy import Column, Integer, String, Text, DECIMAL, TIMESTAMP, Enum, ForeignKey
from app.database import Base

class TransaccionCaja(Base):
    __tablename__ = "transacciones_caja"

    id_transaccion_caja = Column(Integer, primary_key=True, autoincrement=True)
    id_caja = Column(Integer, ForeignKey("cajas.id_caja"))
    tipo = Column(Enum("ingreso","egreso","ajuste"))
    monto = Column(DECIMAL(12,2), nullable=False)
    concepto = Column(String(150))
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    fecha = Column(TIMESTAMP)
    observaciones = Column(Text)
