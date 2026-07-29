import { useState, useEffect, useRef } from "react";
import Select from "react-select";
import useCrudCategorias from "../../../../Hooks/Vendedor/GestionInventario/useCrudCategorias";
import styles from "../../../../assets/Css/crud.module.scss";

export default function MarcaForm({ open, onClose, onSubmit, modoEdicion, marca }) {
    const { categorias, isLoadingCategorias } = useCrudCategorias();
    const [form, setForm] = useState({ nombre: "", id_categoria: "" });
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (marca) {
            setForm({ nombre: marca.nombre, id_categoria: marca.categoria?.id_categoria || "" });
            if (marca.categoria) {
                setCategoriaSeleccionada({
                    value: marca.categoria.id_categoria,
                    label: marca.categoria.nombre,
                });
            }
        } else {
            setForm({ nombre: "", id_categoria: "" });
            setCategoriaSeleccionada(null);
        }
    }, [marca]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoriaChange = (option) => {
        setCategoriaSeleccionada(option);
        setForm((prev) => ({ ...prev, id_categoria: option ? option.value : "" }));
    };

    const handleSubmit = () => {
        if (!form.nombre.trim()) return alert("El nombre es obligatorio");
        if (!form.id_categoria) return alert("Debes seleccionar una categoría");
        onSubmit(form);
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };

    if (!open) return null;

    const optionsCategorias = categorias.map((c) => ({
        value: c.id_categoria,
        label: c.nombre,
    }));

    return (
        <div className={styles.ModalOverlay} onClick={handleOverlayClick}>
            <div ref={modalRef} className={styles.Modal}>
                <button className={styles.CloseButton} onClick={onClose}>
                    <i className="bx bx-x"></i>
                </button>

                <h3>{modoEdicion ? "Editar Marca" : "Nueva Marca"}</h3>

                <div className={styles.ModalContent}>
                    <label>
                        Nombre de la marca
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Coca-Cola"
                            required
                        />
                    </label>

                    <label>
                        Categoría
                        {isLoadingCategorias ? (
                            <div style={{ padding: "10px", color: "var(--texto-sec)" }}>
                                Cargando categorías...
                            </div>
                        ) : (
                            <Select
                                options={optionsCategorias}
                                value={categoriaSeleccionada}
                                onChange={handleCategoriaChange}
                                placeholder="Selecciona una categoría..."
                                isClearable
                                className={styles.SelectCategoria}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        backgroundColor: "var(--input-bg)",
                                        borderColor: state.isFocused ? "var(--rojo-500)" : "var(--input-border)",
                                        color: "var(--input-text)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "0.2rem",
                                        boxShadow: state.isFocused ? "var(--focus-ring)" : "none",
                                        "&:hover": {
                                            borderColor: "var(--rojo-700)",
                                        },
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: "var(--input-bg)",
                                        color: "var(--input-text)",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid var(--input-border)",
                                        zIndex: 100,
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused ? "rgba(198, 40, 40, 0.15)" : "var(--input-bg)",
                                        color: "var(--input-text)",
                                        cursor: "pointer",
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: "var(--input-text)",
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "var(--placeholder)",
                                    }),
                                }}
                            />
                        )}
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
