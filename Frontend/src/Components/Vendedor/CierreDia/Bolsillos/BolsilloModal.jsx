import { useEffect, useMemo, useState } from "react";
import { LuX } from "react-icons/lu";
import styles from "../../../../assets/Css/CierraDia/Bolsillos.module.scss";
import { formatMoney } from "../cierreDia.utils";
import BolsilloIconPicker from "./BolsilloIconPicker";
import { BolsilloIcon, normalizeBolsilloIcon } from "./bolsilloIcons";

const initialForm = {
    nombre: "",
    descripcion: "",
    color: "#c62828",
    icono: "wallet",
    saldo_actual: "0",
};

export default function BolsilloModal({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    initialData,
    colorOptions,
}) {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");

    const isEditing = Boolean(initialData?.id_bolsillo);
    const previewIcon = useMemo(() => normalizeBolsilloIcon(form.icono), [form.icono]);

    useEffect(() => {
        if (open) {
            setForm({
                nombre: initialData?.nombre || "",
                descripcion: initialData?.descripcion || "",
                color: initialData?.color || colorOptions[0],
                icono: normalizeBolsilloIcon(initialData?.icono),
                saldo_actual: initialData?.saldo_actual != null ? String(initialData.saldo_actual) : "0",
            });
            setError("");
        }
    }, [open, initialData, colorOptions]);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!form.nombre.trim()) {
            setError("El nombre del bolsillo es obligatorio.");
            return;
        }

        const saldoActual = Number(form.saldo_actual || 0);
        if (!isEditing && saldoActual < 0) {
            setError("El valor inicial no puede ser negativo.");
            return;
        }

        try {
            await onSubmit({
                nombre: form.nombre.trim(),
                descripcion: form.descripcion.trim() || null,
                color: form.color || null,
                icono: normalizeBolsilloIcon(form.icono),
                saldo_actual: isEditing ? undefined : saldoActual,
            });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo guardar el bolsillo.");
        }
    }

    if (!open) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <header className={styles.modalHeader}>
                    <div>
                        <span className={styles.kicker}>
                            {isEditing ? "Editar bolsillo" : "Nuevo bolsillo"}
                        </span>
                        <h4 className={styles.modalTitle}>
                            {isEditing ? initialData.nombre || "Editar bolsillo" : "Crear un bolsillo"}
                        </h4>
                    </div>
                    <button type="button" className={styles.modalClose} onClick={onClose} disabled={isSubmitting}>
                        <LuX size={18} />
                    </button>
                </header>

                <form className={styles.formGrid} onSubmit={handleSubmit}>
                    <label className={styles.field + " " + styles.fieldFull}>
                        <span className={styles.fieldLabel}>Nombre</span>
                        <input
                            className={styles.fieldInput}
                            type="text"
                            value={form.nombre}
                            onChange={(event) => updateField("nombre", event.target.value)}
                            placeholder="Ej. Proveedores"
                            autoFocus
                        />
                    </label>

                    <label className={styles.field + " " + styles.fieldFull}>
                        <span className={styles.fieldLabel}>Descripcion opcional</span>
                        <textarea
                            className={styles.fieldTextarea}
                            value={form.descripcion}
                            onChange={(event) => updateField("descripcion", event.target.value)}
                            placeholder="Una nota corta para recordar el objetivo del bolsillo"
                            rows="3"
                        />
                    </label>

                    {!isEditing ? (
                        <label className={styles.field + " " + styles.fieldFull}>
                            <span className={styles.fieldLabel}>Valor inicial asignado</span>
                            <input
                                className={styles.fieldInput}
                                type="number"
                                min="0"
                                step="1"
                                value={form.saldo_actual}
                                onChange={(event) => updateField("saldo_actual", event.target.value)}
                                placeholder="0"
                            />
                            <span className={styles.fieldHint}>
                                Se descontara del total disponible al crear el bolsillo.
                            </span>
                        </label>
                    ) : null}

                    <div className={styles.field + " " + styles.fieldFull}>
                        <span className={styles.optionTitle}>Color</span>
                        <div className={styles.colorGrid}>
                            {colorOptions.map((color) => (
                                <button
                                    type="button"
                                    key={color}
                                    className={`${styles.colorSwatch} ${form.color === color ? styles.isSelected : ""}`}
                                    style={{ background: color }}
                                    onClick={() => updateField("color", color)}
                                    aria-label={`Seleccionar color ${color}`}
                                >
                                    <span className={styles.swatchCheck}>✓</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.field + " " + styles.fieldFull}>
                        <span className={styles.optionTitle}>Icono</span>
                        <BolsilloIconPicker value={form.icono} onChange={(icono) => updateField("icono", icono)} />
                    </div>

                    <aside className={styles.previewBox} style={{ ["--accent"]: form.color || colorOptions[0] }}>
                        <span className={styles.previewTitle}>Vista previa</span>
                        <strong>{form.nombre || "Nombre del bolsillo"}</strong>
                        <span>{formatMoney(isEditing ? initialData?.saldo_actual || 0 : form.saldo_actual || 0)}</span>
                        <BolsilloIcon iconKey={previewIcon} size={54} className={styles.previewIcon} />
                    </aside>

                    {error ? <p className={styles.alert}>{error}</p> : null}

                    <footer className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.saveButton} disabled={isSubmitting || !form.nombre.trim()}>
                            {isSubmitting ? "Guardando..." : isEditing ? "Actualizar bolsillo" : "Crear bolsillo"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
