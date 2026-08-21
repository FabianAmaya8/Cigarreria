from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ProveedorProducto(Base):
    __tablename__ = "proveedores_productos"

    id_proveedor = Column(
        Integer,
        ForeignKey("proveedores.id_proveedor"),
        primary_key=True
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto"),
        primary_key=True
    )

    proveedor = relationship(
        "Proveedor",
        back_populates="productos_relacionados"
    )

    producto = relationship(
        "Producto",
        back_populates="proveedores_relacionados"
    )