from sqlalchemy import Column, Integer, String
from app.database import Base

class MetodoPago(Base):
    __tablename__ = "metodos_pago"

    id_metodo = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False)
