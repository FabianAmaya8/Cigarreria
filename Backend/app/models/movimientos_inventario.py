from sqlalchemy import (
    Column,
    Integer,
    Text,
    Enum,
    TIMESTAMP,
    ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id_movimiento = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto"),
        nullable=False
    )

    id_detalle_compra = Column(
        Integer,
        ForeignKey("detalle_compra.id_detalle_compra"),
        nullable=True
    )

    tipo = Column(
        Enum(
            "entrada",
            "salida",
            "ajuste",
            "transferencia",
            name="tipo_movimiento_inventario"
        )
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    id_almacen_origen = Column(
        Integer,
        ForeignKey("almacenes.id_almacen"),
        nullable=True
    )

    id_almacen_destino = Column(
        Integer,
        ForeignKey("almacenes.id_almacen"),
        nullable=True
    )

    motivo = Column(Text)

    fecha = Column(TIMESTAMP)

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=True
    )

    producto = relationship(
        "Producto",
        back_populates="movimientos_inventario"
    )

    detalle_compra = relationship(
        "DetalleCompra",
        back_populates="movimientos_inventario"
    )

    almacen_origen = relationship(
        "Almacen",
        foreign_keys=[id_almacen_origen]
    )

    almacen_destino = relationship(
        "Almacen",
        foreign_keys=[id_almacen_destino]
    )

    usuario = relationship("Usuario")