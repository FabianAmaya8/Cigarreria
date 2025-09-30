from sqlalchemy import Column, Integer, DECIMAL, ForeignKey
from app.database import Base

class DetalleCompra(Base):
    __tablename__ = "detalle_compra"

    id_detalle_compra = Column(Integer, primary_key=True, autoincrement=True)
    id_compra = Column(Integer, ForeignKey("compras.id_compra", ondelete="CASCADE"))
    id_producto = Column(Integer, ForeignKey("productos.id_producto"))
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(DECIMAL(12,2), nullable=False)
