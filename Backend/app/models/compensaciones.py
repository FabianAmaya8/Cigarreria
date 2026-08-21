from sqlalchemy import (
    Column,
    Integer,
    Text,
    DECIMAL,
    Enum,
    TIMESTAMP,
    ForeignKey,
    Computed
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Compensacion(Base):
    __tablename__ = "compensaciones"

    id_compensacion = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_caja = Column(
        Integer,
        ForeignKey("cajas.id_caja"),
        nullable=False
    )

    id_bolsillo = Column(
        Integer,
        ForeignKey("bolsillos.id_bolsillo"),
        nullable=False
    )

    id_compra = Column(
        Integer,
        ForeignKey("compras.id_compra"),
        nullable=True
    )

    id_pago_compra = Column(
        Integer,
        ForeignKey("pagos_compra.id_pago_compra"),
        nullable=True
    )

    monto_original = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    monto_compensado = Column(
        DECIMAL(12, 2),
        nullable=False,
        default=0
    )

    monto_pendiente = Column(
        DECIMAL(12, 2),
        Computed(
            "monto_original - monto_compensado",
            persisted=True
        )
    )

    estado = Column(
        Enum(
            "pendiente",
            "parcial",
            "compensada",
            "anulada",
            name="estado_compensacion"
        ),
        nullable=False,
        default="pendiente"
    )

    fecha_creacion = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    fecha_ultima_compensacion = Column(
        TIMESTAMP,
        nullable=True
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    observaciones = Column(Text)

    caja = relationship(
        "Caja",
        back_populates="compensaciones"
    )

    bolsillo = relationship(
        "Bolsillo",
        back_populates="compensaciones"
    )

    compra = relationship(
        "Compra",
        back_populates="compensaciones"
    )

    pago_compra = relationship("PagoCompra")

    usuario = relationship("Usuario")