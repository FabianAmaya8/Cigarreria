from sqlalchemy import Column, Integer, DECIMAL, ForeignKey
from app.database import Base

class PagoVenta(Base):
    __tablename__ = "pagos_venta"

    id_pago = Column(Integer, primary_key=True, autoincrement=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta", ondelete="CASCADE"))
    id_metodo = Column(Integer, ForeignKey("metodos_pago.id_metodo"))
    monto = Column(DECIMAL(12,2))
