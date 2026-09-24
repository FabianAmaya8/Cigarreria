import { useEffect, useState } from "react";

import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

import ModalShell from "./ModalShell";

import { formatMoney } from "../../../Utils/comprasFormatters";

function AbonoCompensacionModal({
    open,
    compensacion,
    onClose,
    onSubmit,
    isSubmitting,
}) {
    const [monto, setMonto] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !compensacion) return;

        setMonto(
            String(
                compensacion.monto_pendiente || 0
            )
        );

        setError("");
    }, [open, compensacion]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const numeric = Number(monto || 0);

        if (numeric <= 0) {
            setError(
                "El monto debe ser mayor a cero."
            );
            return;
        }

        try {
            await onSubmit({
                idCompensacion:
                    compensacion.id_compensacion,
                monto: numeric,
            });

            onClose();
        } catch (submissionError) {
            setError(
                submissionError?.message ||
                    "No se pudo abonar la compensación."
            );
        }
    }

    if (!open || !compensacion) return null;

    return (
        <ModalShell
            open={open}
            title={`Abonar compensación #${compensacion.id_compensacion}`}
            subtitle={`Pendiente: ${formatMoney(
                compensacion.monto_pendiente
            )}`}
            onClose={onClose}
            narrow
        >
            <form
                className={styles.modalBody}
                onSubmit={handleSubmit}
            >
                <div className={styles.detailGrid}>
                    <article className={styles.detailCard}>
                        <strong>Caja</strong>

                        <span>
                            {compensacion.caja ||
                                `Caja ${compensacion.id_caja}`}
                        </span>
                    </article>

                    <article className={styles.detailCard}>
                        <strong>Bolsillo</strong>

                        <span>
                            {compensacion.bolsillo ||
                                `Bolsillo ${compensacion.id_bolsillo}`}
                        </span>
                    </article>

                    <article className={styles.detailCard}>
                        <strong>Estado</strong>

                        <span>
                            {compensacion.estado}
                        </span>
                    </article>

                    <article className={styles.detailCard}>
                        <strong>Original</strong>

                        <span>
                            {formatMoney(
                                compensacion.monto_original
                            )}
                        </span>
                    </article>
                </div>

                <label className={styles.field}>
                    <span
                        className={
                            styles.fieldLabel
                        }
                    >
                        Monto a abonar
                    </span>

                    <input
                        className={
                            styles.fieldInput
                        }
                        type="number"
                        min="0"
                        step="0.01"
                        value={monto}
                        onChange={(event) =>
                            setMonto(
                                event.target.value
                            )
                        }
                    />
                </label>

                {error ? (
                    <p
                        className={`${styles.alert} ${styles.alertDanger}`}
                    >
                        {error}
                    </p>
                ) : null}

                <footer className={styles.modalFooter}>
                    <button
                        type="button"
                        className={`${styles.button} ${styles.buttonGhost}`}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Abonando..."
                            : "Abonar"}
                    </button>
                </footer>
            </form>
        </ModalShell>
    );
}

export default AbonoCompensacionModal;