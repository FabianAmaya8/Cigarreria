from sqlalchemy import (
    Column,
    Integer,
    DECIMAL,
    ForeignKey,
    Enum,
    Computed
)
from sqlalchemy.orm import relationship
from app.database import Base

class DetalleCompra(Base):
    __tablename__ = "detalle_compra"

    id_detalle_compra = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_compra = Column(
        Integer,
        ForeignKey(
            "compras.id_compra",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto"),
        nullable=False
    )

    cantidad_solicitada = Column(
        Integer,
        nullable=False
    )

    cantidad_recibida = Column(
        Integer,
        nullable=False,
        default=0
    )

    precio_pedido = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    precio_recibido = Column(
        DECIMAL(12, 2),
        nullable=True
    )

    estado = Column(
        Enum(
            "pendiente",
            "parcial",
            "completo",
            "no_recibido",
            name="estado_detalle_compra"
        ),
        nullable=False,
        default="pendiente"
    )

    subtotal_pedido = Column(
        DECIMAL(12, 2),
        Computed(
            "cantidad_solicitada * precio_pedido",
            persisted=True
        )
    )

    subtotal_recibido = Column(
        DECIMAL(12, 2),
        Computed(
            """
            cantidad_recibida *
            COALESCE(precio_recibido, precio_pedido)
            """,
            persisted=True
        )
    )

    compra = relationship(
        "Compra",
        back_populates="detalles"
    )

    producto = relationship(
        "Producto",
        back_populates="detalles_compra"
    )

    movimientos_inventario = relationship(
        "MovimientoInventario",
        back_populates="detalle_compra"
    )

    devoluciones = relationship(
        "DetalleDevolucionCompra",
        back_populates="detalle_compra"
    )