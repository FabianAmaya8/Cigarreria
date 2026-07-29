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
                stock_actual: 0,
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
                    <label>
                        Código de Barras
                        <input
                            type="text"
                            name="codigo_barras"
                            value={form.codigo_barras}
                            onChange={handleChange}
                            placeholder="Ej: 770200100001"
                        />
                    </label>

                    <label>
                        Nombre
                        <input
                            type="text"
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Nombre del producto"
                            required
                        />
                    </label>

                    <label>
                        Marca
                        {isLoadingMarcas ? (
                            <div style={{ padding: "10px", color: "var(--texto-sec)" }}>
                                Cargando marcas...
                            </div>
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
                                    input: (base) => ({
                                        ...base,
                                        color: "var(--input-text)",
                                    }),
                                }}
                            />
                        )}
                    </label>

                    <label>
                        Descripción
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Describe el producto..."
                            rows="3"
                        />
                    </label>

                    <div className={styles.ImagenContainer}>
                        <label htmlFor="imgProduc">
                            Imagen del producto
                            <div className={styles.ImagenPreview} onClick={() => document.getElementById("imgProduc").click()}>
                                {preview ? (
                                    <img src={preview} alt="Vista previa" loading="lazy" />
                                ) : (
                                    <i className="bx bx-image-add"></i>
                                )}
                            </div>
                        </label>
                        <input
                            id="imgProduc"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>

                    <div className={styles.FilaInputs}>
                        <label>
                            Precio Compra
                            <input
                                type="number"
                                name="precio_compra"
                                value={form.precio_compra}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </label>

                        <label>
                            Precio Venta
                            <input
                                type="number"
                                name="precio_venta"
                                value={form.precio_venta}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </label>
                    </div>

                    <div className={styles.FilaInputs}>
                        <label>
                            Stock Mínimo
                            <input
                                type="number"
                                name="stock_minimo"
                                value={form.stock_minimo}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </label>

                        <label>
                            Unidad de Medida
                            <input
                                type="text"
                                name="unidad_medida"
                                value={form.unidad_medida}
                                onChange={handleChange}
                                placeholder="Ej: kg, L, ud"
                            />
                        </label>
                    </div>

                    <label className={styles.SwitchLabel}>
                        <input
                            type="checkbox"
                            name="activo"
                            checked={form.activo}
                            onChange={handleChange}
                        />
                        <span className={styles.Switch}></span>
                        <span className={styles.SwitchText}>
                            Producto {form.activo ? "Activo" : "Desactivado"}
                        </span>
                    </label>
                </div>

                <div className={styles.ModalActions}>
                    <button className={styles.btn_secondary} onClick={onClose}>
                        <i className="bx bx-x"></i>
                        Cancelar
                    </button>
                    <button className={styles.btn_primary} onClick={handleSubmit}>
                        <i className={`bx ${modoEdicion ? "bx-check" : "bx-plus"}`}></i>
                        {modoEdicion ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
