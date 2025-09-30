from sqlalchemy import Column, Integer, DECIMAL, ForeignKey
from app.database import Base

class DetalleDeuda(Base):
    __tablename__ = "detalle_deuda"

    id_detalle_deuda = Column(Integer, primary_key=True, autoincrement=True)
    id_deuda = Column(Integer, ForeignKey("deudas.id_deuda", ondelete="CASCADE"))
    id_producto = Column(Integer, ForeignKey("productos.id_producto"))
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(DECIMAL(12,2), nullable=False)
    subtotal = Column(DECIMAL(12,2), nullable=False)
