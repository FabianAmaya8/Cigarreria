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
                    <label>Nombre de la marca
                        <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Ej: Coca-Cola"
                        />
                    </label>

                    <label>Categoría</label>
                    {isLoadingCategorias ? (
                        <p>Cargando categorías...</p>
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
                                    borderColor: state.isFocused
                                        ? "var(--input-focus-border)"
                                        : "var(--input-border)",
                                    color: "var(--input-text)",
                                    borderRadius: "var(--radius-sm)",
                                    padding: "0.2rem 0.3rem",
                                    boxShadow: "none",
                                    "&:hover": {
                                        borderColor: "var(--input-focus-border)",
                                    },
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: "var(--input-bg)",
                                    color: "var(--input-text)",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--input-border)",
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused
                                        ? "var(--input-focus-border)"
                                        : "var(--input-bg)",
                                    color: "var(--input-text)",
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "var(--input-text)",
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: "var(--input-placeholder)",
                                }),
                            }}
                        />
                    )}
                </div>

                <div className={styles.ModalActions}>
                    <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn-primary" onClick={handleSubmit}>
                        {modoEdicion ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
