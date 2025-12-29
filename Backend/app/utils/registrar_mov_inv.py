from app.models.movimientos_inventario import MovimientoInventario
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

# ===========================
# 📦 Registrar movimiento de inventario
# ===========================
def registrar_movimiento_inventario(
    db: Session,
    id_producto: int,
    tipo: str,  # 'entrada' | 'salida' | 'ajuste' | 'transferencia'
    cantidad: int,
    id_usuario: int,
    motivo: str,
    id_almacen_origen: Optional[int] = None,
    id_almacen_destino: Optional[int] = None
):
    movimiento = MovimientoInventario(
        id_producto=id_producto,
        tipo=tipo,
        cantidad=cantidad,
        id_almacen_origen=id_almacen_origen,
        id_almacen_destino=id_almacen_destino,
        motivo=motivo,
        id_usuario=id_usuario,
        fecha=datetime.now()
    )

    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)

    return movimiento
