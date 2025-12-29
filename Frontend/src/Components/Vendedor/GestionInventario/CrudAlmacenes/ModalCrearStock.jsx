import { useState, useRef, useEffect } from "react";
import styles from "../../../../assets/Css/crud.module.scss";

export default function ModalCrearStock({ open, onClose, onSubmit, productos, almacenes }) {
    const modalRef = useRef(null);

    // 🧩 Si `productos` viene como arreglo o como objeto
    const producto = Array.isArray(productos) ? productos[0] : productos;

    const [form, setForm] = useState({
        id_producto: producto?.id_producto || "",
        id_almacen: "",
        stock: "",
    });

    // 🔄 Cada vez que cambie el producto, actualizar el id
    useEffect(() => {
        if (producto) {
            setForm((prev) => ({
                ...prev,
                id_producto: producto.id_producto,
            }));
        }
    }, [producto]);

    // 🔘 Cerrar si se hace click fuera del modal
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    // 🧠 Actualizar campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 💾 Guardar
    const handleSubmit = () => {
        const { id_producto, id_almacen, stock } = form;

        if (!id_producto || !id_almacen || !stock) {
            alert("Todos los campos son obligatorios");
            return;
        }

        onSubmit({
            id_producto: parseInt(id_producto),
            id_almacen: parseInt(id_almacen),
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

                <h3>Crear nuevo registro de stock</h3>

                <div className={`${styles.ModalContent} ${styles.ScrollableContent}`}>
                    <p>
                        Producto: <b>{producto?.nombre || "Sin nombre"}</b>
                    </p>

                    <label>Almacén</label>
                    <select
                        name="id_almacen"
                        value={form.id_almacen}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar almacén</option>
                        {almacenes.map((a) => (
                            <option key={a.id_almacen} value={a.id_almacen}>
                                {a.nombre_almacen}
                            </option>
                        ))}
                    </select>

                    <label>Cantidad inicial</label>
                    <input
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                        placeholder="Ej: 10"
                    />
                </div>

                <div className={styles.ModalActions}>
                    <button className="btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-primary" onClick={handleSubmit}>
                        Crear
                    </button>
                </div>
            </div>
        </div>
    );
}
