import { FaCircleDollarToSlot, FaPiggyBank, FaSackDollar, FaRegChartBar } from "react-icons/fa6";
import styles from "../../../../assets/Css/CierraDia/CierreDia.module.scss";
import { formatMoney } from "../cierreDia.utils";

export default function ResumenGeneral({
    totalCierre,
    totalAsignado,
    totalDisponible,
    porcentajeAsignado,
    porcentajeDisponible,
    estadoCierre,
}) {
    return (
        <div className={styles.summaryGrid}>
            <article className={styles.statCard}>
                <span className={styles.statLabel}>
                    <FaCircleDollarToSlot />
                    Total recibido
                </span>
                <strong className={styles.statValue}>{formatMoney(totalCierre)}</strong>
                <span className={styles.statHint}>Base disponible del cierre</span>
            </article>

            <article className={styles.statCard}>
                <span className={styles.statLabel}>
                    <FaPiggyBank />
                    Dinero asignado
                </span>
                <strong className={styles.statValue}>{formatMoney(totalAsignado)}</strong>
                <span className={styles.statHint}>{porcentajeAsignado.toFixed(0)}% organizado</span>
            </article>

            <article className={styles.statCard}>
                <span className={styles.statLabel}>
                    <FaSackDollar />
                    Disponible por asignar
                </span>
                <strong className={styles.statValue}>{formatMoney(totalDisponible)}</strong>
                <span className={styles.statHint}>{porcentajeDisponible.toFixed(0)}% libre</span>
            </article>

            <article className={styles.statCard}>
                <span className={styles.statLabel}>
                    <FaRegChartBar />
                    Estado general
                </span>
                <strong className={styles.statValue}>{estadoCierre}</strong>
                <span className={styles.statHint}>Distribucion ficticia y visual</span>
            </article>
        </div>
    );
}
