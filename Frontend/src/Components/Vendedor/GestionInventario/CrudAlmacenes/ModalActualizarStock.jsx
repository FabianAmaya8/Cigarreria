import { useState, useRef, useMemo, useEffect } from "react";
import styles from "../../../../assets/Css/crud.module.scss";
import Swal from "sweetalert2";

export default function ModalActualizarStock({ open, onClose, onSubmit, item }) {
    const modalRef = useRef(null);
    const [almacenSeleccionado, setAlmacenSeleccionado] = useState("");
    const [stock, setStock] = useState("");


    const almacenes = useMemo(() => item?.almacenes || [], [item]);


    useEffect(() => {
        if (almacenSeleccionado) {
            const almacen = almacenes.find(a => a.id_inventario === parseInt(almacenSeleccionado));
            setStock(almacen ? almacen.stock : "");
        } else {
            setStock("");
        }
    }, [almacenSeleccionado, almacenes]);

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const handleSubmit = () => {
        if (!almacenSeleccionado) {
            Swal.fire("Error", "Seleccione un almacén", "error");
            return;
        }
        if (stock === "" || isNaN(stock) || stock < 0) {
            Swal.fire("Error", "Ingrese un valor válido de stock", "error");
            return;
        }

        onSubmit({
            id_inventario: parseInt(almacenSeleccionado),
            stock: parseInt(stock),
        });

        onClose();
    };

    if (!open) return null;

    return (
        <div className={styles.ModalOverlay} onClick={handleOverlayClick}>
            <div ref={modalRef} className={`${styles.Modal} ${styles.ProductoModal}`}>
                <button className={styles.CloseButton} onClick={onClose}>
                    <i className="bx bx-x"></i>
                </button>

                <h3>Actualizar Stock</h3>

                <div className={`${styles.ModalContent} ${styles.ScrollableContent}`}>
                    <p>
                        Producto: <b>{item?.nombre_producto}</b>
                    </p>

                    <label>Seleccione almacén</label>
                    <select
                        value={almacenSeleccionado}
                        onChange={(e) => setAlmacenSeleccionado(e.target.value)}
                    >
                        <option value="">Seleccionar almacén</option>
                        {almacenes.map((a) => (
                            <option key={a.id_almacen} value={a.id_inventario}>
                                {a.nombre_almacen} (Stock actual: {a.stock})
                            </option>
                        ))}
                    </select>

                    <label>Nuevo Stock</label>
                    <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="Ej: 10"
                        disabled={!almacenSeleccionado}
                    />
                </div>

                <div className={styles.ModalActions}>
                    <button className={styles.btn_secondary} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className={styles.btn_primary} onClick={handleSubmit}>
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
