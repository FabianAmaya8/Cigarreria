from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)
from sqlalchemy.orm import relationship

from app.database import Base


class DetalleDevolucionCompra(Base):
    __tablename__ = "detalle_devolucion_compra"

    id_detalle_devolucion = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_devolucion = Column(
        Integer,
        ForeignKey(
            "devoluciones_compra.id_devolucion",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    id_detalle_compra = Column(
        Integer,
        ForeignKey("detalle_compra.id_detalle_compra"),
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    motivo = Column(
        String(255)
    )

    devolucion = relationship(
        "DevolucionCompra",
        back_populates="detalles"
    )

    detalle_compra = relationship(
        "DetalleCompra",
        back_populates="devoluciones"
    )