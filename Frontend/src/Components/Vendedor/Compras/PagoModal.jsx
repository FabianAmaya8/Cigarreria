import { useEffect, useState } from "react";

import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

import ModalShell from "./ModalShell";

import {
    getEntityId,
    getEntityName,
    formatMoney,
} from "../../../Utils/comprasFormatters";

function PagoModal({
    open,
    compra,
    cajas = [],
    bolsillos = [],
    onClose,
    onSubmit,
    isSubmitting,
}) {
    const [form, setForm] = useState({
        tipo_origen: "caja",
        id_origen: "",
        id_caja: "",
        monto: "",
        observaciones: "",
    });

    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !compra) return;

        const firstCaja = cajas[0];

        setForm({
            tipo_origen: "caja",
            id_origen: firstCaja
                ? String(getEntityId(firstCaja, "caja"))
                : "",
            id_caja: firstCaja
                ? String(getEntityId(firstCaja, "caja"))
                : "",
            monto: String(
                compra.saldo_pendiente ||
                compra.total ||
                0
            ),
            observaciones: "",
        });

        setError("");
    }, [open, compra, cajas]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const monto = Number(form.monto || 0);

        if (monto <= 0) {
            setError("El monto debe ser mayor a cero.");
            return;
        }

        if (!form.id_origen) {
            setError("Selecciona una fuente de pago.");
            return;
        }

        try {
            await onSubmit({
                monto,
                observaciones:
                    form.observaciones.trim() || null,

                origenes: [
                    {
                        tipo_origen: form.tipo_origen,
                        id_origen: Number(form.id_origen),
                        monto,
                        id_caja: form.id_caja
                            ? Number(form.id_caja)
                            : null,
                        observaciones:
                            form.observaciones.trim() || null,
                    },
                ],
            });

            onClose();
        } catch (submissionError) {
            setError(
                submissionError?.message ||
                    "No se pudo registrar el pago."
            );
        }
    }

    if (!open || !compra) {
        return null;
    }

    const sourceList =
        form.tipo_origen === "caja"
            ? cajas
            : bolsillos;

    return (
        <ModalShell
            open={open}
            title={`Pago compra #${compra.id_compra}`}
            subtitle={`Saldo pendiente: ${formatMoney(
                compra.saldo_pendiente
            )}`}
            onClose={onClose}
            narrow
        >
            <form
                className={styles.modalBody}
                onSubmit={handleSubmit}
            >
                <div className={styles.formGrid}>
                    {/* Tipo de origen */}
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Tipo de origen
                        </span>

                        <select
                            className={styles.fieldSelect}
                            value={form.tipo_origen}
                            onChange={(event) => {
                                const nextType =
                                    event.target.value;

                                const first =
                                    (
                                        nextType === "caja"
                                            ? cajas
                                            : bolsillos
                                    )[0];

                                setForm((current) => ({
                                    ...current,

                                    tipo_origen:
                                        nextType,

                                    id_origen: first
                                        ? String(
                                              getEntityId(
                                                  first,
                                                  nextType
                                              )
                                          )
                                        : "",

                                    id_caja:
                                        cajas[0]
                                            ? String(
                                                  getEntityId(
                                                      cajas[0],
                                                      "caja"
                                                  )
                                              )
                                            : "",
                                }));
                            }}
                        >
                            <option value="caja">
                                Caja
                            </option>

                            <option value="bolsillo">
                                Bolsillo
                            </option>
                        </select>
                    </label>

                    {/* Caja / Bolsillo */}
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            {form.tipo_origen === "caja"
                                ? "Caja"
                                : "Bolsillo"}
                        </span>

                        <select
                            className={styles.fieldSelect}
                            value={form.id_origen}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    id_origen:
                                        event.target.value,
                                }))
                            }
                        >
                            <option value="">
                                Selecciona
                            </option>

                            {(sourceList || []).map(
                                (item) => (
                                    <option
                                        key={getEntityId(
                                            item,
                                            form.tipo_origen
                                        )}
                                        value={getEntityId(
                                            item,
                                            form.tipo_origen
                                        )}
                                    >
                                        {getEntityName(item)}
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    {/* Caja soporte */}
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Caja soporte
                        </span>

                        <select
                            className={styles.fieldSelect}
                            value={form.id_caja}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    id_caja:
                                        event.target.value,
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

                    {/* Monto */}
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Monto
                        </span>

                        <input
                            className={styles.fieldInput}
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.monto}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    monto:
                                        event.target.value,
                                }))
                            }
                        />
                    </label>
                </div>

                {/* Observaciones */}
                <label
                    className={`${styles.field} ${styles.full}`}
                >
                    <span className={styles.fieldLabel}>
                        Observaciones
                    </span>

                    <textarea
                        className={styles.fieldTextarea}
                        rows="3"
                        value={form.observaciones}
                        onChange={(event) =>
                            setForm((current) => ({
                                ...current,
                                observaciones:
                                    event.target.value,
                            }))
                        }
                    />
                </label>

                {/* Error */}
                {error ? (
                    <p
                        className={`${styles.alert} ${styles.alertDanger}`}
                    >
                        {error}
                    </p>
                ) : null}

                {/* Botones */}
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
                            ? "Registrando..."
                            : "Registrar pago"}
                    </button>
                </footer>
            </form>
        </ModalShell>
    );
}

export default PagoModal;