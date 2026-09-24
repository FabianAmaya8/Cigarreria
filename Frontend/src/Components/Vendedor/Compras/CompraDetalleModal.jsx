import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

import ModalShell from "./ModalShell";

import {
    formatMoney,
    formatDate,
    getProveedorNombre,
} from "../../../Utils/comprasFormatters";

function CompraDetalleModal({
    open,
    compra,
    alertas = [],
    onClose,
    onEdit,
    onReceive,
    onPay,
    onReturn,
    onCompensate,
}) {
    if (!open || !compra) return null;

    return (
        <ModalShell
            open={open}
            title={`Compra #${compra.id_compra}`}
            subtitle={`Proveedor: ${getProveedorNombre(compra)} | Factura: ${
                compra.numero_factura || "Sin factura"
            }`}
            onClose={onClose}
        >
            <div className={styles.modalBody}>
                {alertas.length ? (
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h4>Alertas</h4>
                                <p>Mensajes generados por el backend.</p>
                            </div>

                            <span
                                className={`${styles.badge} ${styles.badgeWarning}`}
                            >
                                {alertas.length}
                            </span>
                        </div>

                        <div className={styles.stack}>
                            {alertas.map((alerta, index) => (
                                <div
                                    key={`${alerta.tipo}-${index}`}
                                    className={`${styles.alert} ${
                                        alerta.severidad === "error"
                                            ? styles.alertDanger
                                            : styles.alertInfo
                                    }`}
                                >
                                    <strong>{alerta.tipo}</strong>
                                    <div>{alerta.mensaje}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                <section className={styles.detailGrid}>
                    <article className={styles.detailCard}>
                        <strong>Estados</strong>
                        <span>Pedido: {compra.estado_pedido}</span>
                        <span>
                            Recepción: {compra.estado_recepcion}
                        </span>
                        <span>Pago: {compra.estado_pago}</span>
                    </article>

                    <article className={styles.detailCard}>
                        <strong>Totales</strong>
                        <span>
                            Total: {formatMoney(compra.total)}
                        </span>
                        <span>
                            Pagado: {formatMoney(compra.total_pagado)}
                        </span>
                        <span>
                            Saldo: {formatMoney(compra.saldo_pendiente)}
                        </span>
                    </article>

                    <article className={styles.detailCard}>
                        <strong>Fechas</strong>
                        <span>
                            Pedido: {formatDate(compra.fecha_pedido)}
                        </span>
                        <span>
                            Entrega: {formatDate(compra.fecha_entrega)}
                        </span>
                        <span>
                            Recepción:{" "}
                            {formatDate(compra.fecha_recepcion)}
                        </span>
                    </article>

                    <article className={styles.detailCard}>
                        <strong>Factura y notas</strong>
                        <span>
                            Factura:{" "}
                            {compra.numero_factura || "Sin factura"}
                        </span>
                        <span>
                            Archivo:{" "}
                            {compra.archivo_factura || "Sin referencia"}
                        </span>
                        <span>
                            Observaciones:{" "}
                            {compra.observaciones ||
                                "Sin observaciones"}
                        </span>
                    </article>
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h4>Productos</h4>
                            <p>Líneas de detalle de la compra.</p>
                        </div>

                        <span
                            className={`${styles.badge} ${styles.badgeInfo}`}
                        >
                            {compra.detalles?.length || 0} líneas
                        </span>
                    </div>

                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cant. pedida</th>
                                    <th>Cant. recibida</th>
                                    <th>Precio pedido</th>
                                    <th>Precio recibido</th>
                                    <th>Subtotal</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>

                            <tbody>
                                {(compra.detalles || []).map(
                                    (detalle) => (
                                        <tr
                                            key={
                                                detalle.id_detalle_compra
                                            }
                                        >
                                            <td data-label="Producto">
                                                <div
                                                    className={
                                                        styles.stack
                                                    }
                                                >
                                                    <strong>
                                                        {detalle.producto
                                                            ?.nombre ||
                                                            `Producto ${detalle.id_producto}`}
                                                    </strong>

                                                    <span
                                                        className={
                                                            styles.muted
                                                        }
                                                    >
                                                        {detalle
                                                            .producto
                                                            ?.codigo_barras ||
                                                            "Sin código"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td data-label="Cant. pedida">
                                                {
                                                    detalle.cantidad_solicitada
                                                }
                                            </td>

                                            <td data-label="Cant. recibida">
                                                {
                                                    detalle.cantidad_recibida
                                                }
                                            </td>

                                            <td data-label="Precio pedido">
                                                {formatMoney(
                                                    detalle.precio_pedido
                                                )}
                                            </td>

                                            <td data-label="Precio recibido">
                                                {formatMoney(
                                                    detalle.precio_recibido ??
                                                        detalle.precio_pedido
                                                )}
                                            </td>

                                            <td data-label="Subtotal">
                                                {formatMoney(
                                                    detalle.precio_pedido * detalle.cantidad_solicitada
                                                )}
                                            </td>

                                            <td data-label="Estado">
                                                <span
                                                    className={`${styles.badge} ${
                                                        detalle.estado ===
                                                        "completo"
                                                            ? styles.badgeActive
                                                            : detalle.estado ===
                                                                "parcial"
                                                              ? styles.badgeWarning
                                                              : styles.badgeInactive
                                                    }`}
                                                >
                                                    {detalle.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className={styles.inlineActions}>
                    {!compra.fecha_recepcion ? (
                        <button
                            type="button"
                            className={`${styles.button} ${styles.buttonGhost}`}
                            onClick={onEdit}
                        >
                            Editar
                        </button>
                    ) : null}

                    {!compra.fecha_recepcion ? (
                        <button
                            type="button"
                            className={`${styles.button} ${styles.buttonPrimary}`}
                            onClick={onReceive}
                        >
                            Recibir compra
                        </button>
                    ) : null}

                    {Number(compra.saldo_pendiente || 0) > 0 ? (
                        <button
                            type="button"
                            className={`${styles.button} ${styles.buttonSecondary}`}
                            onClick={onPay}
                        >
                            Registrar pago
                        </button>
                    ) : null}

                    {compra.fecha_recepcion ? (
                        <button
                            type="button"
                            className={`${styles.button} ${styles.buttonGhost}`}
                            onClick={onReturn}
                        >
                            Registrar devolución
                        </button>
                    ) : null}

                    <button
                        type="button"
                        className={`${styles.button} ${styles.buttonGhost}`}
                        onClick={onCompensate}
                    >
                        Crear compensación
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

export default CompraDetalleModal;