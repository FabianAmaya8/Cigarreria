import { FaPenToSquare, FaPlus, FaMinus, FaTrash, FaMoneyBillWave } from "react-icons/fa6";
import styles from "../../../../assets/Css/CierraDia/Bolsillos.module.scss";
import { formatDate, formatMoney } from "../cierreDia.utils";
import { BolsilloIcon } from "./bolsilloIcons";

export default function BolsilloCard({
    pocket,
    accent,
    icon,
    totalCierre,
    onEdit,
    onOpenMovimiento,
    onOpenPago,
    onDelete,
    isBusy,
}) {
    const amount = Number(pocket.saldo_actual || 0);
    const pocketPercent = totalCierre > 0 ? (amount / totalCierre) * 100 : 0;
    const clippedPercent = Math.max(0, Math.min(100, pocketPercent));

    return (
        <article className={styles.bolsilloCard} style={{ ["--accent"]: accent }}>
            <div className={styles.bolsilloAccent} />
            <header className={styles.bolsilloHead}>
                <div className={styles.bolsilloIdentity}>
                    <span className={styles.bolsilloAvatar} style={{ background: accent }}>
                        <BolsilloIcon iconKey={icon} size={22} />
                    </span>
                    <div className={styles.bolsilloInfo}>
                        <strong className={styles.bolsilloName}>{pocket.nombre}</strong>
                        <span className={styles.bolsilloDesc}>{pocket.descripcion || "Sin descripcion"}</span>
                    </div>
                </div>
            </header>

            <div className={styles.moneyRow}>
                <strong className={styles.moneyMain}>{formatMoney(amount)}</strong>
                <span className={styles.moneyMeta}>Asignado al bolsillo</span>
            </div>

            <div className={styles.cardProgress}>
                <span style={{ width: `${clippedPercent}%`, background: accent }} />
            </div>

            <footer className={styles.cardFooter}>

                <div className={styles.cardActions}>
                    <button type="button" className={styles.actionButton} onClick={() => onEdit(pocket)} disabled={isBusy}>
                        <FaPenToSquare />
                        Editar
                    </button>
                    <button type="button" className={styles.actionButton} onClick={() => onOpenMovimiento(pocket, "entrada")} disabled={isBusy}>
                        <FaPlus />
                        Agregar
                    </button>
                    <button type="button" className={styles.actionButton} onClick={() => onOpenMovimiento(pocket, "salida")} disabled={isBusy}>
                        <FaMinus />
                        Sacar
                    </button>
                    <button type="button" className={styles.actionButton} onClick={() => onOpenPago(pocket)} disabled={isBusy}>
                        <FaMoneyBillWave />
                        Pago
                    </button>
                    <button type="button" className={styles.dangerButton} onClick={() => onDelete(pocket)} disabled={isBusy}>
                        <FaTrash />
                        Eliminar
                    </button>
                </div>
            </footer>
        </article>
    );
}
