import { useState, useEffect, useRef } from "react";
import styles from "../../../../assets/Css/crud.module.scss";

export default function CategoriaForm({ open, onClose, onSubmit, modoEdicion, categoria }) {
    const [form, setForm] = useState({ nombre: "", descripcion: "" });
    const modalRef = useRef(null);

    useEffect(() => {
        if (categoria) setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || "" });
        else setForm({ nombre: "", descripcion: "" });
    }, [categoria]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!form.nombre.trim()) return alert("El nombre es obligatorio");
        onSubmit(form);
    };

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };

    if (!open) return null;

    return (
        <div className={styles.ModalOverlay} onClick={handleOverlayClick}>
            <div ref={modalRef} className={styles.Modal}>
                <button className={styles.CloseButton} onClick={onClose}>
                    <i className="bx bx-x"></i>
                </button>

                <h3>{modoEdicion ? "Editar Categoría" : "Nueva Categoría"}</h3>

                <div className={styles.ModalContent}>
                    <label>
                        Nombre de la categoría
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Bebidas"
                            required
                        />
                    </label>

                    <label>
                        Descripción
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Describe esta categoría..."
                            rows="4"
                        />
                    </label>
                </div>

                <div className={styles.ModalActions}>
                    <button className={`${styles.ModalActions} btn-secondary`} onClick={onClose}>
                        <i className="bx bx-x"></i>
                        Cancelar
                    </button>
                    <button className={`${styles.ModalActions} btn-primary`} onClick={handleSubmit}>
                        <i className={`bx ${modoEdicion ? "bx-check" : "bx-plus"}`}></i>
                        {modoEdicion ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
