import styles from "../../../../assets/Css/CierraDia/CierreDia.module.scss";
import { clampPercent, formatMoney } from "../cierreDia.utils";

export default function ProgressResumen({ totalAsignado, totalDisponible, porcentajeAsignado }) {
    return (
        <div className={styles.progressSection}>
            <div className={styles.progressTrack}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${clampPercent(porcentajeAsignado)}%` }}
                />
            </div>
            <div className={styles.progressLegend}>
                <span>{formatMoney(totalAsignado)} ya repartidos</span>
                <span>{formatMoney(totalDisponible)} aún disponibles</span>
            </div>
        </div>
    );
}
