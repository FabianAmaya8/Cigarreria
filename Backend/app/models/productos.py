from sqlalchemy import Column, Integer, String, DECIMAL, Boolean, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)
    codigo_barras = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    imagen = Column(String(255))
    descripcion = Column(Text)
    precio_compra = Column(DECIMAL(12,2), nullable=False)
    precio_venta = Column(DECIMAL(12,2), nullable=False)
    stock_actual = Column(Integer, default=0)
    stock_minimo = Column(Integer, default=0)
    activo = Column(Boolean, default=True)

    detalle_ventas = relationship("DetalleVenta", back_populates="producto")
