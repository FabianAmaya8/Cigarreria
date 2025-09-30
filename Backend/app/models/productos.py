from sqlalchemy import Column, Integer, String, Text, DECIMAL, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, autoincrement=True)
    codigo_barras = Column(String(50), unique=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    imagen = Column(String(255))
    descripcion = Column(Text)
    id_marca = Column(Integer, ForeignKey("marcas.id_marca"))
    precio_compra = Column(DECIMAL(12,2), nullable=False)
    precio_venta = Column(DECIMAL(12,2), nullable=False)
    stock_actual = Column(Integer, default=0)
    stock_minimo = Column(Integer, default=0)
    unidad_medida = Column(String(50))
    activo = Column(Boolean, default=True)

    marca = relationship("Marca", back_populates="productos")