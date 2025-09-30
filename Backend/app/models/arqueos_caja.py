from sqlalchemy import Column, Integer, Text, DECIMAL, TIMESTAMP, ForeignKey
from app.database import Base

class ArqueoCaja(Base):
    __tablename__ = "arqueos_caja"

    id_arqueo = Column(Integer, primary_key=True, autoincrement=True)
    id_caja = Column(Integer, ForeignKey("cajas.id_caja"))
    fecha_apertura = Column(TIMESTAMP)
    fecha_cierre = Column(TIMESTAMP)
    saldo_apertura = Column(DECIMAL(12,2))
    saldo_cierre = Column(DECIMAL(12,2))
    observaciones = Column(Text)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
