from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Proveedor(Base):
    __tablename__ = "proveedores"

    id_proveedor = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    nombre = Column(
        String(150),
        nullable=False
    )

    nit = Column(String(50))
    telefono = Column(String(50))
    correo = Column(String(100))
    direccion = Column(String(150))
    ciudad = Column(String(100))
    pais = Column(String(100))

    observaciones = Column(Text)

    activo = Column(
        Boolean,
        nullable=False,
        default=True
    )

    fecha_creacion = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    compras = relationship(
        "Compra",
        back_populates="proveedor"
    )

    productos_relacionados = relationship(
        "ProveedorProducto",
        back_populates="proveedor",
        cascade="all, delete-orphan"
    )