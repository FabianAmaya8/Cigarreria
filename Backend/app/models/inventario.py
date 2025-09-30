from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Inventario(Base):
    __tablename__ = "inventario"

    id_inventario = Column(Integer, primary_key=True, autoincrement=True)
    id_almacen = Column(Integer, ForeignKey("almacenes.id_almacen"))
    id_producto = Column(Integer, ForeignKey("productos.id_producto"))
    stock = Column(Integer, default=0)

    almacen = relationship("Almacen")
    producto = relationship("Producto")
