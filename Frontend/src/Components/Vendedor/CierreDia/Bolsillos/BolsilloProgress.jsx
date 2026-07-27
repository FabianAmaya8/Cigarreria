import styles from "../../../../assets/Css/CierraDia/Bolsillos.module.scss";
import { clampPercent, formatMoney } from "../cierreDia.utils";

export default function BolsilloProgress({ totalAsignado, totalDisponible, porcentajeAsignado }) {
    return (
        <div className={styles.progressWrap}>
            <div className={styles.progressHeader}>
                <span>Progreso de distribucion</span>
                <strong>{porcentajeAsignado.toFixed(0)}%</strong>
            </div>
            <div className={styles.progressTrack}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${clampPercent(porcentajeAsignado)}%` }}
                />
            </div>
            <div className={styles.progressFooter}>
                <span>{formatMoney(totalAsignado)} organizados</span>
                <span>{formatMoney(totalDisponible)} libres</span>
            </div>
        </div>
    );
}
