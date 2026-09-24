import { formatMoney } from "../../../Utils/comprasFormatters";

export default function CompraStats({ stats, styles }) {
    const cards = [
        ["Total compras", stats.total],
        ["Pendientes de pago", stats.pendientesPago],
        ["Pendientes de recepción", stats.pendientesRecepcion],
        ["Saldo pendiente", formatMoney(stats.saldoPendiente)],
    ];

    return (
        <section className={styles.statGrid}>
            {cards.map(([label, value]) => (
                <article className={styles.statCard} key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                </article>
            ))}
        </section>
    );
}
