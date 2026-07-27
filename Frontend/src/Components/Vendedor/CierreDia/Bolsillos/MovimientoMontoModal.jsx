import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import styles from "../../../../assets/Css/CierraDia/Bolsillos.module.scss";

const initialForm = {
    monto: "",
    motivo: "",
};

export default function MovimientoMontoModal({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    title,
    subtitle,
    confirmLabel,
    amountLabel = "Monto",
    amountHint,
    initialData = initialForm,
}) {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setForm({
                monto: initialData.monto || "",
                motivo: initialData.motivo || "",
            });
            setError("");
        }
    }, [open, initialData]);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const monto = Number(form.monto || 0);
        if (monto <= 0) {
            setError("El monto debe ser mayor que cero.");
            return;
        }

        try {
            await onSubmit({
                monto,
                motivo: form.motivo.trim() || null,
            });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo completar la operacion.");
        }
    }

    if (!open) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <header className={styles.modalHeader}>
                    <div>
                        <span className={styles.kicker}>{subtitle}</span>
                        <h4 className={styles.modalTitle}>{title}</h4>
                    </div>
                    <button type="button" className={styles.modalClose} onClick={onClose} disabled={isSubmitting}>
                        <LuX size={18} />
                    </button>
                </header>

                <form className={styles.formGrid} onSubmit={handleSubmit}>
                    <label className={styles.field + " " + styles.fieldFull}>
                        <span className={styles.fieldLabel}>{amountLabel}</span>
                        <input
                            className={styles.fieldInput}
                            type="number"
                            min="0"
                            step="1"
                            value={form.monto}
                            onChange={(event) => updateField("monto", event.target.value)}
                            placeholder="0"
                            autoFocus
                        />
                        {amountHint ? <span className={styles.fieldHint}>{amountHint}</span> : null}
                    </label>

                    <label className={styles.field + " " + styles.fieldFull}>
                        <span className={styles.fieldLabel}>Motivo</span>
                        <textarea
                            className={styles.fieldTextarea}
                            value={form.motivo}
                            onChange={(event) => updateField("motivo", event.target.value)}
                            placeholder="Describe brevemente la operacion"
                            rows="3"
                        />
                    </label>

                    {error ? <p className={styles.alert}>{error}</p> : null}

                    <footer className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
                            {isSubmitting ? "Procesando..." : confirmLabel}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
