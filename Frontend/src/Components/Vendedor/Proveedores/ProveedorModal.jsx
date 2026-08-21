import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import styles from "../../../assets/Css/Vendedor/ComprasProveedores.module.scss";

const emptyForm = {
    nombre: "",
    nit: "",
    telefono: "",
    correo: "",
    direccion: "",
    ciudad: "",
    pais: "",
    observaciones: "",
    activo: true,
};

export default function ProveedorModal({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    initialData,
}) {
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setForm({
            nombre: initialData?.nombre || "",
            nit: initialData?.nit || "",
            telefono: initialData?.telefono || "",
            correo: initialData?.correo || "",
            direccion: initialData?.direccion || "",
            ciudad: initialData?.ciudad || "",
            pais: initialData?.pais || "",
            observaciones: initialData?.observaciones || "",
            activo: initialData?.activo ?? true,
        });
        setError("");
    }, [open, initialData]);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!form.nombre.trim()) {
            setError("El nombre del proveedor es obligatorio.");
            return;
        }

        try {
            await onSubmit({
                nombre: form.nombre.trim(),
                nit: form.nit.trim() || null,
                telefono: form.telefono.trim() || null,
                correo: form.correo.trim() || null,
                direccion: form.direccion.trim() || null,
                ciudad: form.ciudad.trim() || null,
                pais: form.pais.trim() || null,
                observaciones: form.observaciones.trim() || null,
                activo: form.activo,
            });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo guardar el proveedor.");
        }
    }

    if (!open) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={`${styles.modal} ${styles.modalNarrow}`} onClick={(event) => event.stopPropagation()}>
                <header className={styles.modalHeader}>
                    <div>
                        <span className={styles.kicker}>
                            {initialData?.id_proveedor ? "Editar proveedor" : "Nuevo proveedor"}
                        </span>
                        <h3 className={styles.modalTitle}>
                            {initialData?.id_proveedor ? initialData.nombre || "Proveedor" : "Crear proveedor"}
                        </h3>
                        <p className={styles.modalSub}>
                            Registra la información básica para compras y seguimiento.
                        </p>
                    </div>
                    <button type="button" className={styles.button} onClick={onClose} aria-label="Cerrar modal">
                        <LuX size={18} />
                    </button>
                </header>

                <form className={styles.modalBody} onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <label className={styles.field + " " + styles.full}>
                            <span className={styles.fieldLabel}>Nombre</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={form.nombre}
                                onChange={(event) => updateField("nombre", event.target.value)}
                                placeholder="Ej. Distribuidora XYZ"
                                autoFocus
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Documento / NIT</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={form.nit}
                                onChange={(event) => updateField("nit", event.target.value)}
                                placeholder="Opcional"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Teléfono</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={form.telefono}
                                onChange={(event) => updateField("telefono", event.target.value)}
                                placeholder="Opcional"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Correo</span>
                            <input
                                className={styles.fieldInput}
                                type="email"
                                value={form.correo}
                                onChange={(event) => updateField("correo", event.target.value)}
                                placeholder="Opcional"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Ciudad</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={form.ciudad}
                                onChange={(event) => updateField("ciudad", event.target.value)}
                                placeholder="Opcional"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>País</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={form.pais}
                                onChange={(event) => updateField("pais", event.target.value)}
                                placeholder="Opcional"
                            />
                        </label>

                        <label className={styles.field + " " + styles.full}>
                            <span className={styles.fieldLabel}>Dirección</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                value={form.direccion}
                                onChange={(event) => updateField("direccion", event.target.value)}
                                placeholder="Opcional"
                            />
                        </label>

                        <label className={styles.field + " " + styles.full}>
                            <span className={styles.fieldLabel}>Observaciones</span>
                            <textarea
                                className={styles.fieldTextarea}
                                value={form.observaciones}
                                onChange={(event) => updateField("observaciones", event.target.value)}
                                placeholder="Notas útiles sobre el proveedor"
                                rows="3"
                            />
                        </label>

                        <label className={styles.field + " " + styles.full}>
                            <span className={styles.fieldLabel}>Estado</span>
                            <select
                                className={styles.fieldSelect}
                                value={form.activo ? "true" : "false"}
                                onChange={(event) => updateField("activo", event.target.value === "true")}
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </label>
                    </div>

                    {error ? <p className={`${styles.alert} ${styles.alertDanger}`}>{error}</p> : null}

                    <footer className={styles.modalFooter}>
                        <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : initialData?.id_proveedor ? "Actualizar" : "Crear"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
