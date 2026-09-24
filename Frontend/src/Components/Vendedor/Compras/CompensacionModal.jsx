import { useEffect, useState } from "react";

import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

import ModalShell from "./ModalShell";

import { getEntityName } from "../../../Utils/comprasFormatters";

function CompensacionModal({
    open,
    cajas = [],
    bolsillos = [],
    onClose,
    onSubmit,
    isSubmitting,
    initialData = {},
}) {
    const [form, setForm] = useState({
        id_caja: "",
        id_bolsillo: "",
        monto_original: "",
        observaciones: "",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        setForm({
            id_caja:
                initialData.id_caja ||
                (cajas[0]
                    ? String(cajas[0].id_caja)
                    : ""),

            id_bolsillo:
                initialData.id_bolsillo ||
                (bolsillos[0]
                    ? String(
                          bolsillos[0].id_bolsillo
                      )
                    : ""),

            monto_original:
                initialData.monto_original || "",

            observaciones:
                initialData.observaciones || "",
        });

        setError("");
    }, [
        open,
        initialData,
        cajas,
        bolsillos,
    ]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const monto = Number(
            form.monto_original || 0
        );

        if (!form.id_caja || !form.id_bolsillo) {
            setError(
                "Selecciona una caja y un bolsillo."
            );
            return;
        }

        if (monto <= 0) {
            setError(
                "El monto debe ser mayor a cero."
            );
            return;
        }

        try {
            await onSubmit({
                id_caja: Number(form.id_caja),
                id_bolsillo: Number(
                    form.id_bolsillo
                ),
                monto_original: monto,
                observaciones:
                    form.observaciones.trim() ||
                    null,
                id_compra:
                    initialData.id_compra ||
                    null,
                id_pago_compra:
                    initialData.id_pago_compra ||
                    null,
            });

            onClose();
        } catch (submissionError) {
            setError(
                submissionError?.message ||
                    "No se pudo crear la compensación."
            );
        }
    }

    if (!open) return null;

    return (
        <ModalShell
            open={open}
            title="Nueva compensación"
            subtitle="Mueve saldo entre caja y bolsillo."
            onClose={onClose}
            narrow
        >
            <form
                className={styles.modalBody}
                onSubmit={handleSubmit}
            >
                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        <span
                            className={
                                styles.fieldLabel
                            }
                        >
                            Caja
                        </span>

                        <select
                            className={
                                styles.fieldSelect
                            }
                            value={form.id_caja}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    id_caja:
                                        event.target
                                            .value,
                                }))
                            }
                        >
                            <option value="">
                                Selecciona
                            </option>

                            {(cajas || []).map(
                                (caja) => (
                                    <option
                                        key={
                                            caja.id_caja
                                        }
                                        value={
                                            caja.id_caja
                                        }
                                    >
                                        {getEntityName(
                                            caja,
                                            `Caja ${caja.id_caja}`
                                        )}
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span
                            className={
                                styles.fieldLabel
                            }
                        >
                            Bolsillo
                        </span>

                        <select
                            className={
                                styles.fieldSelect
                            }
                            value={
                                form.id_bolsillo
                            }
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    id_bolsillo:
                                        event.target
                                            .value,
                                }))
                            }
                        >
                            <option value="">
                                Selecciona
                            </option>

                            {(bolsillos || []).map(
                                (bolsillo) => (
                                    <option
                                        key={
                                            bolsillo.id_bolsillo
                                        }
                                        value={
                                            bolsillo.id_bolsillo
                                        }
                                    >
                                        {getEntityName(
                                            bolsillo,
                                            `Bolsillo ${bolsillo.id_bolsillo}`
                                        )}
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span
                            className={
                                styles.fieldLabel
                            }
                        >
                            Monto original
                        </span>

                        <input
                            className={
                                styles.fieldInput
                            }
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                form.monto_original
                            }
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    monto_original:
                                        event.target
                                            .value,
                                }))
                            }
                        />
                    </label>

                    <label
                        className={`${styles.field} ${styles.full}`}
                    >
                        <span
                            className={
                                styles.fieldLabel
                            }
                        >
                            Observaciones
                        </span>

                        <textarea
                            className={
                                styles.fieldTextarea
                            }
                            rows="3"
                            value={
                                form.observaciones
                            }
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    observaciones:
                                        event.target
                                            .value,
                                }))
                            }
                        />
                    </label>
                </div>

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
                            ? "Guardando..."
                            : "Crear compensación"}
                    </button>
                </footer>
            </form>
        </ModalShell>
    );
}

export default CompensacionModal;