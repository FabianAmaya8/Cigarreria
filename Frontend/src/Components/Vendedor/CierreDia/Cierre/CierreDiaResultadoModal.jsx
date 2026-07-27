import { LuX } from "react-icons/lu";
import styles from "../../../../assets/Css/CierraDia/CierreDia.module.scss";
import { formatMoney, formatDate } from "../cierreDia.utils";

function renderValue(value) {
    if (value === null || value === undefined) return "Sin dato";
    if (typeof value === "number") return formatMoney(value);
    return String(value);
}

export default function CierreDiaResultadoModal({ open, onClose, data }) {
    if (!open || !data) return null;

    const observaciones = data?.observaciones?.split("\n") ?? [];

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(event) => event.stopPropagation()}
            >
                <header className={styles.modalHeader}>
                    <div>
                        <span className={styles.kicker}>Cierre realizado</span>
                        <h4 className={styles.modalTitle}>
                            Resultado del cierre del dia
                        </h4>
                    </div>
                    <button
                        type="button"
                        className={styles.modalClose}
                        onClick={onClose}
                    >
                        <LuX size={18} />
                    </button>
                </header>

                <div className={styles.formGrid}>
                    <article className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>
                            Cantidad a dejar
                        </span>
                        <strong className={styles.summaryValue}>
                            {formatMoney(renderValue(data.cantidad_a_dejar))}
                        </strong>
                    </article>

                    <article className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>
                            Total enviado a bolsillos
                        </span>
                        <strong className={styles.summaryValue}>
                            {formatMoney(
                                renderValue(data.total_enviado_bolsillos),
                            )}
                        </strong>
                    </article>

                    <article className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>
                            Total ventas
                        </span>
                        <strong className={styles.summaryValue}>
                            {formatMoney(renderValue(data.total_ventas))}
                        </strong>
                    </article>

                    <article className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>
                            Total productos
                        </span>
                        <strong className={styles.summaryValue}>
                            {data.total_productos ?? "Sin dato"}
                        </strong>
                    </article>

                    <article
                        className={`${styles.summaryCard} ${styles.resultadoObservaciones}`}
                    >
                        <span className={styles.summaryLabel}>
                            Resumen del cierre
                        </span>

                        <div className={styles.resultadoTexto}>
                            {observaciones.length === 0 ? (
                                <p className={styles.resultadoLinea}>
                                    Sin observaciones
                                </p>
                            ) : (
                                observaciones.map((linea, index) => {
                                    if (linea.trim() === "") {
                                        return (
                                            <div
                                                key={index}
                                                className={
                                                    styles.resultadoSeparador
                                                }
                                            />
                                        );
                                    }

                                    if (linea.includes("Observaciones:")) {
                                        return (
                                            <p
                                                key={index}
                                                className={
                                                    styles.resultadoLineaTitulo
                                                }
                                            >
                                                {linea}
                                            </p>
                                        );
                                    }

                                    return (
                                        <p
                                            key={index}
                                            className={styles.resultadoLinea}
                                        >
                                            {linea}
                                        </p>
                                    );
                                })
                            )}
                        </div>
                    </article>

                    <article className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>
                            Fecha de cierre
                        </span>
                        <strong className={styles.summaryValue}>
                            {formatDate(data.fecha_cierre ?? "Sin dato")}
                        </strong>
                    </article>
                </div>

                <footer className={styles.modalFooter}>
                    <button
                        type="button"
                        className={styles.saveButton}
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </footer>
            </div>
        </div>
    );
}
