from sqlalchemy import (
    Column,
    Integer,
    Text,
    Enum,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class DevolucionCompra(Base):
    __tablename__ = "devoluciones_compra"

    id_devolucion = Column(
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

    fecha = Column(
        TIMESTAMP,
        server_default=func.now()
    )

    estado = Column(
        Enum(
            "registrada",
            "reclamada",
            "aceptada",
            "rechazada",
            "cerrada",
            name="estado_devolucion_compra"
        ),
        nullable=False,
        default="registrada"
    )

    observaciones = Column(Text)

    compra = relationship(
        "Compra",
        back_populates="devoluciones"
    )

    usuario = relationship("Usuario")

    detalles = relationship(
        "DetalleDevolucionCompra",
        back_populates="devolucion",
        cascade="all, delete-orphan"
    )