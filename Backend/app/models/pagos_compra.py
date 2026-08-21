from sqlalchemy import (
    Column,
    Integer,
    Text,
    DECIMAL,
    Enum,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class PagoCompra(Base):
    __tablename__ = "pagos_compra"

    id_pago_compra = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_compra = Column(
        Integer,
        ForeignKey("compras.id_compra"),
        nullable=False
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    fecha_pago = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    monto = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    estado = Column(
        Enum(
            "registrado",
            "anulado",
            name="estado_pago_compra_registro"
        ),
        nullable=False,
        default="registrado"
    )

    observaciones = Column(Text)

    compra = relationship(
        "Compra",
        back_populates="pagos"
    )

    usuario = relationship("Usuario")

    origenes = relationship(
        "PagoOrigen",
        back_populates="pago",
        cascade="all, delete-orphan"
    )

    movimientos_libro_mayor = relationship(
        "LibroMayor",
        back_populates="pago_compra"
    )