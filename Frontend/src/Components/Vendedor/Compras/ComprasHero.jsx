export default function ComprasHero({ onNewCompra, onNewCompensacion, styles }) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroTitle}>
                <span className={styles.kicker}>Compras y proveedores</span>
                <h2>Gestión de Compras</h2>
                <p>
                    Registra órdenes, recepciones, pagos, devoluciones y
                    compensaciones con trazabilidad completa.
                </p>
            </div>
            <div className={styles.heroActions}>
                <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} onClick={onNewCompra}>
                    <i className="bx bx-plus" /> Nueva compra
                </button>
                <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={onNewCompensacion}>
                    <i className="bx bx-transfer" /> Nueva compensación
                </button>
            </div>
        </section>
    );
}
