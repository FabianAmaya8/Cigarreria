import { formatMoney } from "../../../Utils/comprasFormatters";

export default function ComprasSecondarySections({
    compensacionesPendientes = [], productos = [], proveedores = [], bolsillos = [], cajas = [],
    onAbonarCompensacion, styles,
}) {
    return (
        <section className={styles.splitGrid}>
            <article className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3>Compensaciones pendientes</h3>
                        <p>Abona o revisa los movimientos creados desde compras.</p>
                    </div>
                    <span className={`${styles.badge} ${styles.badgeWarning}`}>
                        {compensacionesPendientes.length}
                    </span>
                </div>
                <div className={styles.lineList}>
                    {compensacionesPendientes.map((compensacion) => (
                        <div key={compensacion.id_compensacion} className={`${styles.lineItem} ${styles.lineItemCompact}`}>
                            <div className={styles.lineMain}>
                                <strong>{compensacion.caja || `Caja ${compensacion.id_caja}`}</strong>
                                <span>{compensacion.bolsillo || `Bolsillo ${compensacion.id_bolsillo}`}</span>
                            </div>
                            <div className={styles.lineMain}>
                                <strong>{formatMoney(compensacion.monto_original)}</strong>
                                <span>Abonado: {formatMoney(compensacion.monto_compensado)}</span>
                            </div>
                            <div className={styles.lineMain}>
                                <strong>Saldo</strong>
                                <span>{formatMoney(compensacion.monto_pendiente)}</span>
                            </div>
                            <div className={styles.lineActions}>
                                <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
                                    onClick={() => onAbonarCompensacion(compensacion)}>
                                    Abonar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </article>

            <article className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div><h3>Resumen operativo</h3><p>Vista rápida del módulo.</p></div>
                </div>
                <div className={styles.cardGrid}>
                    <div className={styles.card}><h4>Productos cargados</h4><span>{productos.length}</span></div>
                    <div className={styles.card}><h4>Proveedores activos</h4><span>{proveedores.filter((item) => item.activo).length}</span></div>
                    <div className={styles.card}><h4>Bolsillos disponibles</h4><span>{bolsillos.length}</span></div>
                    <div className={styles.card}><h4>Cajas disponibles</h4><span>{cajas.length}</span></div>
                </div>
            </article>
        </section>
    );
}
