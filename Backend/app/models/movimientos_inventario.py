from sqlalchemy import Column, Integer, Text, Enum, TIMESTAMP, ForeignKey
from app.database import Base

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id_movimiento = Column(Integer, primary_key=True, autoincrement=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"))
    tipo = Column(Enum("entrada","salida","ajuste","transferencia"))
    cantidad = Column(Integer, nullable=False)
    id_almacen_origen = Column(Integer, ForeignKey("almacenes.id_almacen"))
    id_almacen_destino = Column(Integer, ForeignKey("almacenes.id_almacen"))
    motivo = Column(Text)
    fecha = Column(TIMESTAMP)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
