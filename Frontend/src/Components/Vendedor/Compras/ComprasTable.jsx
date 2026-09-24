import { formatDate, formatMoney, getProveedorNombre } from "../../../Utils/comprasFormatters";

export default function ComprasTable({
    compras, onView, onEdit, onReceive, onPay, onReturn, styles,
}) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div>
                    <h3>Listado de compras</h3>
                    <p>Usa los botones de acción para avanzar cada compra por su ciclo completo.</p>
                </div>
                <span className={`${styles.badge} ${styles.badgeInfo}`}>
                    {compras.length} registros
                </span>
            </div>
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Factura</th><th>Proveedor</th><th>Estados</th>
                            <th>Total</th><th>Pagado</th><th>Saldo</th><th>Fecha</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {compras.map((compra) => (
                            <tr key={compra.id_compra}>
                                <td data-label="Factura">
                                    <div className={styles.stack}>
                                        <strong>{compra.numero_factura || `Compra #${compra.id_compra}`}</strong>
                                        <span className={styles.muted}>{compra.archivo_factura || "Sin archivo"}</span>
                                    </div>
                                </td>
                                <td data-label="Proveedor">{getProveedorNombre(compra)}</td>
                                <td data-label="Estados">
                                    <div className={styles.stack}>
                                        <span className={`${styles.badge} ${styles.badgeInfo}`}>{compra.estado_pedido}</span>
                                        <span className={`${styles.badge} ${compra.estado_recepcion === "completa" ? styles.badgeActive : compra.estado_recepcion === "parcial" ? styles.badgeWarning : styles.badgeInactive}`}>
                                            {compra.estado_recepcion}
                                        </span>
                                        <span className={`${styles.badge} ${compra.estado_pago === "pagada" ? styles.badgeActive : compra.estado_pago === "parcial" ? styles.badgeWarning : styles.badgeInactive}`}>
                                            {compra.estado_pago}
                                        </span>
                                    </div>
                                </td>
                                <td data-label="Total">{formatMoney(compra.total)}</td>
                                <td data-label="Pagado">{formatMoney(compra.total_pagado)}</td>
                                <td data-label="Saldo">{formatMoney(compra.saldo_pendiente)}</td>
                                <td data-label="Fecha">{formatDate(compra.fecha_pedido)}</td>
                                <td data-label="Acciones">
                                    <div className={styles.inlineActions}>
                                        <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => onView(compra.id_compra)}>Ver</button>
                                        {!compra.fecha_recepcion && (
                                            <>
                                                <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => onEdit(compra)}>Editar</button>
                                                <button type="button" className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`} onClick={() => onReceive(compra)}>Recibir</button>
                                            </>
                                        )}
                                        {Number(compra.saldo_pendiente || 0) > 0 && (
                                            <button type="button" className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`} onClick={() => onPay(compra)}>Pagar</button>
                                        )}
                                        {compra.fecha_recepcion && (
                                            <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => onReturn(compra)}>Devolver</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
