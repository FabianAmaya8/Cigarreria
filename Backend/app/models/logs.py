from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from app.database import Base

class Log(Base):
    __tablename__ = "logs"

    id_log = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    accion = Column(String(100))
    tabla_afectada = Column(String(100))
    fecha = Column(TIMESTAMP)
    descripcion = Column(Text)
