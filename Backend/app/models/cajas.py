from sqlalchemy import Column, Integer, String, DECIMAL, Boolean
from app.database import Base

class Caja(Base):
    __tablename__ = "cajas"

    id_caja = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    saldo_inicial = Column(DECIMAL(12,2), default=0)
    saldo_actual = Column(DECIMAL(12,2), default=0)
    activo = Column(Boolean, default=True)
