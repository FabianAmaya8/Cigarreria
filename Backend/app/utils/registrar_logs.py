from app.models.logs import Log
from datetime import datetime
from sqlalchemy.orm import Session

# ===========================
# 🧾 Función para registrar logs
# ===========================
def registrar_log(db: Session, id_usuario: int, accion: str, descripcion: str, tabla="inventario"):
    nuevo_log = Log(
        id_usuario=id_usuario,
        accion=accion,
        tabla_afectada=tabla,
        fecha=datetime.now(),
        descripcion=descripcion
    )
    db.add(nuevo_log)
    db.commit()
