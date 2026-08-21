from datetime import datetime

from sqlalchemy.orm import Session

from app.models.logs import Log

# ===========================
# ?? Función para registrar logs
# ===========================
def registrar_log(
    db: Session,
    id_usuario: int,
    accion: str,
    descripcion: str,
    tabla="inventario",
    commit: bool = True,
):
    nuevo_log = Log(
        id_usuario=id_usuario,
        accion=accion,
        tabla_afectada=tabla,
        fecha=datetime.now(),
        descripcion=descripcion
    )
    db.add(nuevo_log)
    if commit:
        db.commit()
    else:
        db.flush()
