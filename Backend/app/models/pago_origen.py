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


class PagoOrigen(Base):
    __tablename__ = "pago_origen"

    id_pago_origen = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_pago_compra = Column(
        Integer,
        ForeignKey(
            "pagos_compra.id_pago_compra",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    tipo_origen = Column(
        Enum(
            "caja",
            "bolsillo",
            name="tipo_origen_pago"
        ),
        nullable=False
    )

    id_origen = Column(
        Integer,
        nullable=False
    )

    monto = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    fecha = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    observaciones = Column(Text)

    pago = relationship(
        "PagoCompra",
        back_populates="origenes"
    )