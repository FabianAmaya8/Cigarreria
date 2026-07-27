import { FaShieldHalved } from "react-icons/fa6";
import styles from "../../../../assets/Css/CierraDia/CierreDia.module.scss";

export default function HeroCierre({
    kicker = "Cierre del dia",
    title = "Controla el efectivo con bolsillos visuales",
    lead = "Organiza el dinero del cierre sin mover dinero real. El sistema te ayuda a ver cuanto tienes, cuanto ya asignaste y cuanto falta por repartir.",
    estadoCierre,
    titleCierre,
    StatusIcon = FaShieldHalved,
}) {
    return (
        <div className={styles.heroHeader}>
            <div className={styles.heroTitle}>
                <span className={styles.sectionKicker}>{kicker}</span>
                <h2>{title}</h2>
                <p className={styles.heroLead}>{lead}</p>
            </div>

            <span title={titleCierre} className={`${styles.heroBadge} ${estadoCierre === "Pendiente" ? styles.badgePending : ""}`}>
                <StatusIcon />
                {estadoCierre}
            </span>
        </div>
    );
}
