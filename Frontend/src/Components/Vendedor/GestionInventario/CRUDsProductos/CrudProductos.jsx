import Select from "react-select";
import { useState, useEffect, useRef } from "react";
import useCrudCategorias from "../../../../Hooks/Vendedor/GestionInventario/useCrudCategorias";
import styles from "../../../../assets/Css/crud.module.scss";

export default function ProductoForm({ open, onClose, onSubmit, modoEdicion, producto }) {
    const { marcas, isLoadingMarcas } = useCrudCategorias();
    const [form, setForm] = useState({
        codigo_barras: "",
        nombre: "",
        descripcion: "",
        precio_compra: "",
        precio_venta: "",
        stock_actual: "",
        stock_minimo: "",
        unidad_medida: "",
        activo: true,
        id_marca: "",
        imagen: null,
    });

    const [preview, setPreview] = useState("");
    const modalRef = useRef(null);

    const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);

    useEffect(() => {
        if (producto) {
            setForm({
                ...producto,
                imagen: null,
            });
            setPreview(producto.imagen || "");

            // si el producto tiene marca, seleccionarla en el Select
            if (producto.id_marca && marcas.length > 0) {
                const marca = marcas.find((m) => m.id_marca === producto.id_marca);
                if (marca) {
                    setMarcaSeleccionada({ value: marca.id_marca, label: marca.nombre });
                }
            }
        } else {
            setForm({
                codigo_barras: "",
                nombre: "",
                descripcion: "",
                precio_compra: "",
                precio_venta: "",
                stock_actual: "",
                stock_minimo: "",
                unidad_medida: "",
                activo: true,
                id_marca: "",
                imagen: null,
            });
            setPreview("");
            setMarcaSeleccionada(null);
        }
    }, [producto, marcas]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm((prev) => ({ ...prev, imagen: file }));

        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleMarcaChange = (option) => {
        setMarcaSeleccionada(option);
        setForm((prev) => ({ ...prev, id_marca: option ? option.value : "" }));
    };

    const handleSubmit = () => {
        if (!form.id_marca) {
            alert("Por favor selecciona una marca");
            return;
        }
        onSubmit(form);
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!open) return null;

    const optionsMarcas = marcas.map((m) => ({
        value: m.id_marca,
        label: m.nombre,
    }));

    return (
        <div className={styles.ModalOverlay} onClick={handleOverlayClick}>
            <div ref={modalRef} className={`${styles.Modal} ${styles.ProductoModal}`}>
                <button className={styles.CloseButton} onClick={onClose}>
                    <i className="bx bx-x"></i>
                </button>

                <h3>{modoEdicion ? "Editar Producto" : "Nuevo Producto"}</h3>

                <div className={`${styles.ModalContent} ${styles.ScrollableContent}`}>
                    <label>Código de Barras
                        <input name="codigo_barras" value={form.codigo_barras} onChange={handleChange} />
                    </label>

                    <label>Nombre
                        <input name="nombre" value={form.nombre} onChange={handleChange} />
                    </label>

                    <label>Marca</label>
                    {isLoadingMarcas ? (
                        <p>Cargando marcas...</p>
                    ) : (
                        <Select
                            options={optionsMarcas}
                            value={marcaSeleccionada}
                            onChange={handleMarcaChange}
                            placeholder="Buscar o seleccionar marca..."
                            isClearable
                            className={styles.SelectMarca}
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
                                    zIndex: 100,
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused
                                        ? "var(--input-focus-border)"
                                        : "var(--input-bg)",
                                    color: "var(--input-text)",
                                    cursor: "pointer",
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: "var(--input-text)",
                                }),
                                placeholder: (base) => ({
                                    ...base,
                                    color: "var(--input-placeholder)",
                                }),
                                input: (base) => ({
                                    ...base,
                                    color: "var(--input-text)",
                                }),
                            }}
                        />
                    )}

                    <label>Descripción
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows="3"
                        />
                    </label>

                    <div className={styles.ImagenContainer}>
                        <label htmlFor="imgProduc">
                            Imagen del producto
                            {preview ? (
                                <div className={styles.ImagenPreview}>
                                    <img src={preview} alt="Vista previa" />
                                </div>
                            ) : (
                                <div className={styles.ImagenPreview}>
                                    <i className="bx bx-image-add"></i>
                                </div>
                            )}
                        </label>
                        <input
                            id="imgProduc"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="d-none"
                        />
                    </div>

                    <div className={styles.FilaInputs}>
                        <label>Precio Compra
                            <input
                                type="number"
                                name="precio_compra"
                                value={form.precio_compra}
                                onChange={handleChange}
                            />
                        </label>

                        <label>Precio Venta
                            <input
                                type="number"
                                name="precio_venta"
                                value={form.precio_venta}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <div className={styles.FilaInputs}>
                        <label>Stock Actual
                            <input
                                type="number"
                                name="stock_actual"
                                value={form.stock_actual}
                                onChange={handleChange}
                            />
                        </label>

                        <label>Stock Mínimo
                            <input
                                type="number"
                                name="stock_minimo"
                                value={form.stock_minimo}
                                onChange={handleChange}
                            />
                        </label>
                    </div>

                    <label>Unidad de Medida
                        <input
                            name="unidad_medida"
                            value={form.unidad_medida}
                            onChange={handleChange}
                        />
                    </label>

                    <label className={styles.SwitchLabel}>
                        <input
                            type="checkbox"
                            name="activo"
                            checked={form.activo}
                            onChange={handleChange}
                        />
                        <span className={styles.Switch}></span>
                        <span className={styles.SwitchText}>
                            {form.activo ? "Producto Activo" : "Producto Desactivado"}
                        </span>
                    </label>
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
