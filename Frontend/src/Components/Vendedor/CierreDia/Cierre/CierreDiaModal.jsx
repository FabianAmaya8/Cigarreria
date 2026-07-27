import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import styles from "../../../../assets/Css/CierraDia/CierreDia.module.scss";
import { formatMoney, getTodayLocalISO } from "../cierreDia.utils";

export default function CierreDiaModal({ open, onClose, onSubmit, isSubmitting }) {
    const hoy = getTodayLocalISO();
    const [cantidadAdejar, setCantidadAdejar] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) {
            setCantidadAdejar("");
            setObservaciones("");
            setError("");
        }
    }, [open]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (cantidadAdejar === "") {
            setError("La cantidad a dejar en caja es obligatoria.");
            return;
        }

        const cantidad = Number(cantidadAdejar);
        if (Number.isNaN(cantidad) || cantidad < 0) {
            setError("La cantidad a dejar en caja debe ser mayor o igual a cero.");
            return;
        }

        try {
            await onSubmit({
                fecha: hoy,
                cantidad_a_dejar: cantidad,
                observaciones: observaciones.trim() || null,
            });
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo realizar el cierre del dia.");
        }
    }

    if (!open) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <header className={styles.modalHeader}>
                    <div>
                        <span className={styles.kicker}>Realizar cierre</span>
                        <h4 className={styles.modalTitle}>Cierre del dia actual</h4>
                    </div>
                    <button type="button" className={styles.modalClose} onClick={onClose} disabled={isSubmitting}>
                        <LuX size={18} />
                    </button>
                </header>

                <form className={styles.formGrid} onSubmit={handleSubmit}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Fecha</span>
                        <input className={styles.fieldInput} type="date" value={hoy} readOnly disabled={isSubmitting} />
                        <span className={styles.fieldHint}>Se utilizara la fecha actual del sistema.</span>
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Cantidad a dejar en caja</span>
                        <input
                            className={styles.fieldInput}
                            type="number"
                            min="0"
                            step="0.01"
                            value={cantidadAdejar}
                            onChange={(event) => setCantidadAdejar(event.target.value)}
                            placeholder="Ej. 150000"
                            disabled={isSubmitting}
                        />
                        <span className={styles.fieldHint}>
                            {cantidadAdejar === "" ? "Ingresa el valor que quedará físicamente en la caja." : formatMoney(cantidadAdejar)}
                        </span>
                    </label>

                    <label className={styles.field + " " + styles.fieldFull}>
                        <span className={styles.fieldLabel}>Observaciones</span>
                        <textarea
                            className={styles.fieldTextarea}
                            value={observaciones}
                            onChange={(event) => setObservaciones(event.target.value)}
                            placeholder="Notas opcionales para el cierre"
                            rows="4"
                            disabled={isSubmitting}
                        />
                    </label>

                    {error ? <p className={styles.alert}>{error}</p> : null}

                    <footer className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Realizar cierre del dia"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}
