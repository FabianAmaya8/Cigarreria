import { useEffect, useState } from "react";

import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

import ModalShell from "./ModalShell";

import { formatMoney } from "../../../Utils/comprasFormatters";

function RecepcionModal({
    open,
    compra,
    onClose,
    onSubmit,
    isSubmitting,
}) {
    const [detalles, setDetalles] = useState([]);
    const [observaciones, setObservaciones] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !compra) return;

        setObservaciones("");
        setError("");

        setDetalles(
            (compra.detalles || []).map((detalle) => ({
                id_detalle_compra:
                    detalle.id_detalle_compra,
                cantidad_recibida:
                    detalle.cantidad_solicitada || 0,
                precio_recibido:
                    detalle.precio_pedido || "",
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

        try {
            await onSubmit({
                detalles: detalles.map((item) => ({
                    id_detalle_compra:
                        item.id_detalle_compra,
                    cantidad_recibida: Number(
                        item.cantidad_recibida || 0
                    ),
                    precio_recibido:
                        item.precio_recibido === ""
                            ? null
                            : Number(item.precio_recibido),
                })),

                observaciones:
                    observaciones.trim() || null,
            });

            onClose();
        } catch (submissionError) {
            setError(
                submissionError?.message ||
                    "No se pudo registrar la recepción."
            );
        }
    }

    if (!open || !compra) return null;

    return (
        <ModalShell
            open={open}
            title={`Recepción compra #${compra.id_compra}`}
            subtitle="Captura las cantidades recibidas y los precios finales."
            onClose={onClose}
        >
            <form
                className={styles.modalBody}
                onSubmit={handleSubmit}
            >
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
                                        {
                                            detalle.cantidad_solicitada
                                        }{" "}
                                        solicitados |{" "}
                                        {formatMoney(
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
                                        Recibido
                                    </span>

                                    <input
                                        className={
                                            styles.miniFieldInput
                                        }
                                        type="number"
                                        min="0"
                                        max={
                                            detalle.cantidad_solicitada
                                        }
                                        value={
                                            detalles[index]
                                                ?.cantidad_recibida ??
                                            0
                                        }
                                        onChange={(event) =>
                                            updateDetalle(
                                                index,
                                                "cantidad_recibida",
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
                                        Precio recibido
                                    </span>

                                    <input
                                        className={
                                            styles.miniFieldInput
                                        }
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            detalles[index]
                                                ?.precio_recibido ??
                                            ""
                                        }
                                        onChange={(event) =>
                                            updateDetalle(
                                                index,
                                                "precio_recibido",
                                                event.target.value
                                            )
                                        }
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
                            : "Registrar recepción"}
                    </button>
                </footer>
            </form>
        </ModalShell>
    );
}

export default RecepcionModal;