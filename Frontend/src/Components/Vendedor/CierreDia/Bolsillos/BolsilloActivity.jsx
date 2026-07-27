import styles from "../../../../assets/Css/CierraDia/Bolsillos.module.scss";
import { formatDate, formatMoney } from "../cierreDia.utils";

function getMovimientoLabel(tipo) {
    if (tipo === "entrada") return "Entrada";
    if (tipo === "salida") return "Salida";
    if (tipo === "pago") return "Pago";
    return "Movimiento";
}

function getMovimientoClass(tipo) {
    if (tipo === "entrada") return styles.timelineDotEntrada;
    if (tipo === "salida") return styles.timelineDotSalida;
    if (tipo === "pago") return styles.timelineDotPago;
    return "";
}

export default function BolsilloActivity({ movimientos = [] }) {
    if (movimientos.length === 0) return null;

    return (
        <section className={styles.activitySection}>
            <header className={styles.sectionHeader}>
                <div>
                    <span className={styles.kicker}>Actividad reciente</span>
                    <h4>Movimientos del bolsillo</h4>
                </div>
                <span className={styles.tag}>{movimientos.length} eventos</span>
            </header>

            <div className={styles.timeline}>
                {movimientos.slice(0, 5).map((movimiento) => (
                    <article key={movimiento.id_movimiento} className={styles.timelineItem}>
                        <span className={`${styles.timelineDot} ${getMovimientoClass(movimiento.tipo)}`} />
                        <div className={styles.timelineBody}>
                            <strong>
                                {getMovimientoLabel(movimiento.tipo)} - {formatMoney(movimiento.monto)}
                            </strong>
                            <p>{movimiento.motivo || "Sin motivo"}</p>
                        </div>
                        <div className={styles.timelineBody}>
                            <strong>Usuario</strong>
                            <p>{movimiento.nombre_usuario}</p>
                        </div>
                        <div className={styles.timelineBody}>
                            <strong>Bolsillo</strong>
                            <p>{movimiento.nombre_bolsillo}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
