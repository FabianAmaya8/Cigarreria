import { useState, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import styles from "../../../../assets/Css/crud.module.scss";

export default function ModalTransferirStock({ open, onClose, onSubmit, item }) {
    const modalRef = useRef(null);

    const [form, setForm] = useState({
        id_almacen_origen: "",
        id_almacen_destino: "",
        cantidad: "",
    });

    // 🔹 Lista fija de almacenes disponibles
    const selectAlmacenes = [
        { id: 1, nombre: "Bodega" },
        { id: 2, nombre: "Vitrinas" },
    ];

    // 🔹 Almacenes origen que contienen el producto
    const almacenesOrigen = useMemo(() => item?.almacenes || [], [item]);

    // 🔹 Almacenes destino (según el arreglo global selectAlmacenes)
    const almacenesDestino = useMemo(() => {
        if (!form.id_almacen_origen) return [];
        return selectAlmacenes.filter(a => a.id !== parseInt(form.id_almacen_origen));
    }, [form.id_almacen_origen]);

    // 🔹 Cerrar si se hace clic fuera del modal
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    // 🔹 Cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Validar y enviar
    const handleSubmit = async () => {
        const { id_almacen_origen, id_almacen_destino, cantidad } = form;

        if (!id_almacen_origen || !id_almacen_destino || !cantidad) {
            Swal.fire({
                icon: "warning",
                title: "Campos incompletos",
                text: "Todos los campos son obligatorios",
            });
            return;
        }

        if (id_almacen_origen === id_almacen_destino) {
            Swal.fire({
                icon: "error",
                title: "Almacenes inválidos",
                text: "El almacén de origen y destino no pueden ser el mismo",
            });
            return;
        }

        if (parseInt(cantidad) <= 0) {
            Swal.fire({
                icon: "error",
                title: "Cantidad inválida",
                text: "La cantidad debe ser mayor a 0",
            });
            return;
        }

        // 🟢 Confirmación visual
        const confirm = await Swal.fire({
            title: "Confirmar transferencia",
            text: `¿Deseas transferir ${cantidad} unidades del producto "${item?.nombre_producto}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, transferir",
            cancelButtonText: "Cancelar",
        });

        if (confirm.isConfirmed) {
            onSubmit({
                id_almacen_origen: parseInt(id_almacen_origen),
                id_almacen_destino: parseInt(id_almacen_destino),
                cantidad: parseInt(cantidad),
            });

            Swal.fire({
                icon: "success",
                title: "Transferencia realizada",
                text: "El stock fue transferido correctamente.",
                timer: 2000,
                showConfirmButton: false,
            });

            onClose();
        }
    };

    if (!open) return null;

    return (
        <div className={styles.ModalOverlay} onClick={handleOverlayClick}>
            <div ref={modalRef} className={`${styles.Modal} ${styles.ProductoModal}`}>
                <button className={styles.CloseButton} onClick={onClose}>
                    <i className="bx bx-x"></i>
                </button>

                <h3>Transferir Stock</h3>

                <div className={`${styles.ModalContent} ${styles.ScrollableContent}`}>
                    <p>
                        Producto: <b>{item?.nombre_producto}</b>
                    </p>

                    {/* 🏭 Origen */}
                    <label>Almacén de origen</label>
                    <select
                        name="id_almacen_origen"
                        value={form.id_almacen_origen}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar almacén de origen</option>
                        {almacenesOrigen.map((a) => (
                            <option key={a.id_almacen} value={a.id_almacen}>
                                {a.nombre_almacen} (Stock: {a.stock})
                            </option>
                        ))}
                    </select>

                    {/* 🎯 Destino */}
                    <label>Almacén de destino</label>
                    <select
                        name="id_almacen_destino"
                        value={form.id_almacen_destino}
                        onChange={handleChange}
                        disabled={!form.id_almacen_origen}
                    >
                        <option value="">Seleccionar almacén de destino</option>
                        {almacenesDestino.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.nombre}
                            </option>
                        ))}
                    </select>

                    {/* 📦 Cantidad */}
                    <label>Cantidad a transferir</label>
                    <input
                        name="cantidad"
                        type="number"
                        value={form.cantidad}
                        onChange={handleChange}
                        placeholder="Ej: 5"
                    />
                </div>

                <div className={styles.ModalActions}>
                    <button className={styles.btn_secondary} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className={styles.btn_primary} onClick={handleSubmit}>
                        Transferir
                    </button>
                </div>
            </div>
        </div>
    );
}
