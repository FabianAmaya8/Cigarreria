import { FaCircleDollarToSlot, FaPiggyBank, FaSackDollar, FaRegChartBar } from "react-icons/fa6";
import styles from "../../../../assets/Css/CierraDia/Bolsillos.module.scss";
import { formatMoney } from "../cierreDia.utils";

export default function BolsilloSummary({
    totalCierre,
    totalAsignado,
    totalDisponible,
    porcentajeAsignado,
    porcentajeDisponible,
    estadoCierre,
}) {
    return (
        <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>
                    <FaCircleDollarToSlot />
                    Total del cierre
                </span>
                <strong className={styles.summaryValue}>{formatMoney(totalCierre)}</strong>
                <span className={styles.summaryNote}>Base disponible para repartir</span>
            </article>

            <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>
                    <FaPiggyBank />
                    Asignado
                </span>
                <strong className={styles.summaryValue}>{formatMoney(totalAsignado)}</strong>
                <span className={styles.summaryNote}>{porcentajeAsignado.toFixed(0)}% distribuido</span>
            </article>

            <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>
                    <FaSackDollar />
                    Disponible
                </span>
                <strong className={styles.summaryValue}>{formatMoney(totalDisponible)}</strong>
                <span className={styles.summaryNote}>{porcentajeDisponible.toFixed(0)}% por asignar</span>
            </article>

            <article className={styles.summaryCard}>
                <span className={styles.summaryLabel}>
                    <FaRegChartBar />
                    Estado
                </span>
                <strong className={styles.summaryValue}>{estadoCierre}</strong>
                <span className={styles.summaryNote}>Control visual del efectivo</span>
            </article>
        </div>
    );
}
