from sqlalchemy import Column, Integer, Text, DECIMAL, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Compra(Base):
    __tablename__ = "compras"

    id_compra = Column(Integer, primary_key=True, autoincrement=True)
    id_proveedor = Column(Integer, ForeignKey("proveedores.id_proveedor"))
    fecha_compra = Column(TIMESTAMP)
    total = Column(DECIMAL(12,2))
    estado = Column(Enum("pendiente","recibida","cancelada"))
    observaciones = Column(Text)

    proveedor = relationship("Proveedor")
