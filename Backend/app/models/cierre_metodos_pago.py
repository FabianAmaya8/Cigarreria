from sqlalchemy import Column, Integer, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class CierreMetodoPago(Base):
    __tablename__ = "cierre_metodos_pago"

    id_detalle = Column(Integer, primary_key=True)
    id_cierre = Column(Integer, ForeignKey("cierres_dia.id_cierre"))
    id_metodo_pago = Column(Integer, ForeignKey("metodos_pago.id_metodo"))
    total = Column(DECIMAL(12,2), nullable=False)

    cierre = relationship("CierreDia", back_populates="metodos_pago")
    metodo_pago = relationship("MetodoPago")
