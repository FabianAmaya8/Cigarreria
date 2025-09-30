from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Almacen(Base):
    __tablename__ = "almacenes"

    id_almacen = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    activo = Column(Boolean, default=True)
