import { useEffect, useState } from "react";

import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

import ModalShell from "./ModalShell";

import { formatMoney } from "../../../Utils/comprasFormatters";

function DevolucionModal({
    open,
    compra,
    onClose,
    onSubmit,
    isSubmitting,
}) {
    const [detalles, setDetalles] = useState([]);
    const [motivo, setMotivo] = useState("");
    const [observaciones, setObservaciones] =
        useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !compra) return;

        setMotivo("");
        setObservaciones("");
        setError("");

        setDetalles(
            (compra.detalles || []).map((detalle) => ({
                id_detalle_compra:
                    detalle.id_detalle_compra,
                cantidad: 0,
                motivo: "",
            }))
        );
    }, [open, compra]);

    function updateDetalle(index, field, value) {
        setDetalles((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const payloadDetalles = detalles
            .filter(
                (item) =>
                    Number(item.cantidad || 0) > 0
            )
            .map((item) => ({
                id_detalle_compra:
                    item.id_detalle_compra,
                cantidad: Number(
                    item.cantidad || 0
                ),
                motivo:
                    item.motivo.trim() ||
                    motivo.trim() ||
                    null,
            }));

        if (!payloadDetalles.length) {
            setError(
                "Debes indicar al menos una cantidad a devolver."
            );
            return;
        }

        try {
            await onSubmit({
                motivo: motivo.trim() || null,
                observaciones:
                    observaciones.trim() || null,
                detalles: payloadDetalles,
            });

            onClose();
        } catch (submissionError) {
            setError(
                submissionError?.message ||
                    "No se pudo registrar la devolución."
            );
        }
    }

    if (!open || !compra) return null;

    return (
        <ModalShell
            open={open}
            title={`Devolución compra #${compra.id_compra}`}
            subtitle="Registra cantidades devueltas por línea de producto."
            onClose={onClose}
        >
            <form
                className={styles.modalBody}
                onSubmit={handleSubmit}
            >
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>
                        Motivo general
                    </span>

                    <input
                        className={styles.fieldInput}
                        value={motivo}
                        onChange={(event) =>
                            setMotivo(event.target.value)
                        }
                        placeholder="Ej. producto averiado"
                    />
                </label>

                <div className={styles.lineList}>
                    {(compra.detalles || []).map(
                        (detalle, index) => (
                            <div
                                key={
                                    detalle.id_detalle_compra
                                }
                                className={`${styles.lineItem} ${styles.lineItemCompact}`}
                            >
                                <div
                                    className={
                                        styles.lineMain
                                    }
                                >
                                    <strong>
                                        {detalle.producto
                                            ?.nombre ||
                                            `Producto ${detalle.id_producto}`}
                                    </strong>

                                    <span>
                                        Recibido:{" "}
                                        {
                                            detalle.cantidad_recibida
                                        }{" "}
                                        |{" "}
                                        {formatMoney(
                                            detalle.precio_recibido ??
                                                detalle.precio_pedido
                                        )}
                                    </span>
                                </div>

                                <label
                                    className={
                                        styles.miniField
                                    }
                                >
                                    <span
                                        className={
                                            styles.miniFieldLabel
                                        }
                                    >
                                        Cantidad
                                    </span>

                                    <input
                                        className={
                                            styles.miniFieldInput
                                        }
                                        type="number"
                                        min="0"
                                        max={
                                            detalle.cantidad_recibida ||
                                            0
                                        }
                                        value={
                                            detalles[index]
                                                ?.cantidad ?? 0
                                        }
                                        onChange={(event) =>
                                            updateDetalle(
                                                index,
                                                "cantidad",
                                                event.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label
                                    className={
                                        styles.miniField
                                    }
                                >
                                    <span
                                        className={
                                            styles.miniFieldLabel
                                        }
                                    >
                                        Motivo
                                    </span>

                                    <input
                                        className={
                                            styles.miniFieldInput
                                        }
                                        value={
                                            detalles[index]
                                                ?.motivo ?? ""
                                        }
                                        onChange={(event) =>
                                            updateDetalle(
                                                index,
                                                "motivo",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Opcional"
                                    />
                                </label>
                            </div>
                        )
                    )}
                </div>

                <label
                    className={`${styles.field} ${styles.full}`}
                >
                    <span className={styles.fieldLabel}>
                        Observaciones
                    </span>

                    <textarea
                        className={styles.fieldTextarea}
                        rows="3"
                        value={observaciones}
                        onChange={(event) =>
                            setObservaciones(
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
                            ? "Registrando..."
                            : "Registrar devolución"}
                    </button>
                </footer>
            </form>
        </ModalShell>
    );
}

export default DevolucionModal;