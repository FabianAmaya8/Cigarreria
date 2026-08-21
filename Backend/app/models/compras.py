from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DECIMAL,
    Enum,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Compra(Base):
    __tablename__ = "compras"

    id_compra = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_proveedor = Column(
        Integer,
        ForeignKey("proveedores.id_proveedor"),
        nullable=True
    )

    fecha_pedido = Column(
        TIMESTAMP,
        nullable=False,
        server_default=func.now()
    )

    fecha_recepcion = Column(
        TIMESTAMP,
        nullable=True
    )

    numero_factura = Column(
        String(100),
        nullable=True
    )

    archivo_factura = Column(
        String(255),
        nullable=True
    )

    estado_pedido = Column(
        Enum(
            "pendiente",
            "cancelada",
            "completada",
            name="estado_pedido_compra"
        ),
        nullable=False,
        default="pendiente"
    )

    estado_recepcion = Column(
        Enum(
            "pendiente",
            "parcial",
            "completa",
            name="estado_recepcion_compra"
        ),
        nullable=False,
        default="pendiente"
    )

    estado_pago = Column(
        Enum(
            "pendiente",
            "parcial",
            "pagada",
            "credito",
            name="estado_pago_compra"
        ),
        nullable=False,
        default="pendiente"
    )

    total = Column(
        DECIMAL(12, 2),
        nullable=False,
        default=0
    )

    observaciones = Column(Text)

    proveedor = relationship(
        "Proveedor",
        back_populates="compras"
    )

    detalles = relationship(
        "DetalleCompra",
        back_populates="compra",
        cascade="all, delete-orphan"
    )

    pagos = relationship(
        "PagoCompra",
        back_populates="compra",
        cascade="all, delete-orphan"
    )

    libro_mayor = relationship(
        "LibroMayor",
        back_populates="compra"
    )

    compensaciones = relationship(
        "Compensacion",
        back_populates="compra"
    )

    devoluciones = relationship(
        "DevolucionCompra",
        back_populates="compra"
    )