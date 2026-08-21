from sqlalchemy import (
    Column,
    BigInteger,
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


class LibroMayor(Base):
    __tablename__ = "libro_mayor"

    id_movimiento = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    fecha = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    tipo_movimiento = Column(
        Enum(
            "pago_compra",
            "devolucion_compra",
            "compensacion",
            "transferencia",
            "ajuste",
            "otro",
            name="tipo_movimiento_libro_mayor"
        ),
        nullable=False
    )

    origen_tipo = Column(
        String(50),
        nullable=False
    )

    origen_id = Column(
        Integer,
        nullable=True
    )

    destino_tipo = Column(
        String(50),
        nullable=False
    )

    destino_id = Column(
        Integer,
        nullable=True
    )

    monto = Column(
        DECIMAL(12, 2),
        nullable=False
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
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

    referencia_tipo = Column(
        String(50),
        nullable=True
    )

    referencia_id = Column(
        Integer,
        nullable=True
    )

    concepto = Column(
        String(255)
    )

    observaciones = Column(Text)

    estado = Column(
        Enum(
            "activo",
            "anulado",
            name="estado_libro_mayor"
        ),
        nullable=False,
        default="activo"
    )

    usuario = relationship("Usuario")

    compra = relationship(
        "Compra",
        back_populates="libro_mayor"
    )

    pago_compra = relationship(
        "PagoCompra",
        back_populates="movimientos_libro_mayor"
    )