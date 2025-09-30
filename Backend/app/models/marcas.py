from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Marca(Base):
    __tablename__ = "marcas"

    id_marca = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    id_categoria = Column(Integer, ForeignKey("categorias.id_categoria"))

    categoria = relationship("Categoria", back_populates="marcas")
    productos = relationship("Producto", back_populates="marca")
