from sqlalchemy import Column, Integer, String
from app.database import Base

class Proveedor(Base):
    __tablename__ = "proveedores"

    id_proveedor = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    nit = Column(String(50))
    telefono = Column(String(50))
    correo = Column(String(100))
    direccion = Column(String(150))
    ciudad = Column(String(100))
    pais = Column(String(100))
