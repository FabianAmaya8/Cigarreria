import { useMemo, useState } from "react";
import { LuX } from "react-icons/lu";
import styles from "../../../assets/Css/Vendedor/ComprasProveedores.module.scss";

function formatMoney(value) {
    const numeric = Number(value || 0);
    return `$ ${numeric.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function ProveedorDetalleModal({
    open,
    onClose,
    proveedor,
    productos = [],
    compras = [],
    historial = [],
}) {
    const [tab, setTab] = useState("productos");

    const esYo = useMemo(() => proveedor?.nombre?.trim()?.toUpperCase() === "YO", [proveedor]);

    if (!open || !proveedor) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <header className={styles.modalHeader}>
                    <div>
                        <span className={styles.kicker}>Detalle del proveedor</span>
                        <h3 className={styles.modalTitle}>
                            {proveedor.nombre}
                            {esYo ? <span className={`${styles.badge} ${styles.badgeYo}`} style={{ marginLeft: 8 }}>YO</span> : null}
                        </h3>
                        <p className={styles.modalSub}>
                            {proveedor.nit || "Sin documento"} · {proveedor.telefono || "Sin teléfono"} · {proveedor.correo || "Sin correo"}
                        </p>
                    </div>
                    <button type="button" className={styles.button} onClick={onClose}>
                        <LuX size={18} />
                    </button>
                </header>

                <div className={styles.modalBody}>
                    <section className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <h4>Información general</h4>
                                <p className={styles.muted}>Datos básicos del proveedor y su estado actual.</p>
                            </div>
                            <span className={`${styles.badge} ${proveedor.activo ? styles.badgeActive : styles.badgeInactive}`}>
                                {proveedor.activo ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                        <div className={styles.cardList}>
                            <span><strong>NIT:</strong> {proveedor.nit || "—"}</span>
                            <span><strong>Teléfono:</strong> {proveedor.telefono || "—"}</span>
                            <span><strong>Correo:</strong> {proveedor.correo || "—"}</span>
                            <span><strong>Dirección:</strong> {proveedor.direccion || "—"}</span>
                            <span><strong>Ciudad:</strong> {proveedor.ciudad || "—"}</span>
                            <span><strong>País:</strong> {proveedor.pais || "—"}</span>
                            <span><strong>Observaciones:</strong> {proveedor.observaciones || "—"}</span>
                        </div>
                    </section>

                    <div className={styles.actionsRow}>
                        <button type="button" className={`${styles.button} ${tab === "productos" ? styles.buttonPrimary : styles.buttonGhost}`} onClick={() => setTab("productos")}>
                            Productos ({productos.length})
                        </button>
                        <button type="button" className={`${styles.button} ${tab === "compras" ? styles.buttonPrimary : styles.buttonGhost}`} onClick={() => setTab("compras")}>
                            Compras ({compras.length})
                        </button>
                        <button type="button" className={`${styles.button} ${tab === "historial" ? styles.buttonPrimary : styles.buttonGhost}`} onClick={() => setTab("historial")}>
                            Historial de precios ({historial.length})
                        </button>
                    </div>

                    {tab === "productos" ? (
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h4>Productos relacionados</h4>
                                    <p className={styles.muted}>Productos que ya han sido comprados con este proveedor.</p>
                                </div>
                                <span className={`${styles.badge} ${styles.badgeInfo}`}>{productos.length} relacionados</span>
                            </div>

                            {productos.length === 0 ? (
                                <div className={styles.emptyState} style={{ minHeight: 160 }}>
                                    <strong>No hay productos relacionados todavía</strong>
                                    <p>La relación se crea automáticamente cuando se hace una compra.</p>
                                </div>
                            ) : (
                                <div className={styles.cardGrid}>
                                    {productos.map((producto) => (
                                        <article key={producto.id_producto} className={styles.card}>
                                            <div className={styles.cardHeader}>
                                                <div>
                                                    <h4>{producto.nombre}</h4>
                                                    <p className={styles.muted}>{producto.codigo_barras}</p>
                                                </div>
                                                <span className={`${styles.badge} ${producto.activo ? styles.badgeActive : styles.badgeInactive}`}>
                                                    {producto.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </div>
                                            <div className={styles.cardMeta}>
                                                {producto.imagen ? <span>Con imagen</span> : <span>Sin imagen</span>}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : null}

                    {tab === "compras" ? (
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h4>Compras recientes</h4>
                                    <p className={styles.muted}>Historial de facturas y estados asociados a este proveedor.</p>
                                </div>
                                <span className={`${styles.badge} ${styles.badgeInfo}`}>{compras.length} registros</span>
                            </div>

                            {compras.length === 0 ? (
                                <div className={styles.emptyState} style={{ minHeight: 160 }}>
                                    <strong>No hay compras registradas</strong>
                                    <p>Cuando se creen compras para este proveedor aparecerán aquí.</p>
                                </div>
                            ) : (
                                <div className={styles.tableWrap}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Factura</th>
                                                <th>Pedido</th>
                                                <th>Recepción</th>
                                                <th>Pago</th>
                                                <th>Total</th>
                                                <th>Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compras.map((compra) => (
                                                <tr key={compra.id_compra}>
                                                    <td data-label="Factura">{compra.numero_factura || "—"}</td>
                                                    <td data-label="Pedido">
                                                        <span className={`${styles.badge} ${styles.badgeInfo}`}>{compra.estado_pedido}</span>
                                                    </td>
                                                    <td data-label="Recepción">
                                                        <span className={`${styles.badge} ${compra.estado_recepcion === "completa" ? styles.badgeActive : styles.badgeWarning}`}>{compra.estado_recepcion}</span>
                                                    </td>
                                                    <td data-label="Pago">
                                                        <span className={`${styles.badge} ${compra.estado_pago === "pagada" ? styles.badgeActive : compra.estado_pago === "parcial" ? styles.badgeWarning : styles.badgeInactive}`}>{compra.estado_pago}</span>
                                                    </td>
                                                    <td data-label="Total">{formatMoney(compra.total)}</td>
                                                    <td data-label="Saldo">{formatMoney(compra.saldo_pendiente)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    ) : null}

                    {tab === "historial" ? (
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h4>Historial de precios</h4>
                                    <p className={styles.muted}>Consulta el precio pedido y recibido por producto y fecha.</p>
                                </div>
                                <span className={`${styles.badge} ${styles.badgeWarning}`}>{historial.length} filas</span>
                            </div>

                            {historial.length === 0 ? (
                                <div className={styles.emptyState} style={{ minHeight: 160 }}>
                                    <strong>No hay precios históricos</strong>
                                    <p>Las compras recibidas poblarán esta sección.</p>
                                </div>
                            ) : (
                                <div className={styles.tableWrap}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Pedido</th>
                                                <th>Recibido</th>
                                                <th>Solicitado</th>
                                                <th>Recibido</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historial.map((fila) => (
                                                <tr key={`${fila.id_detalle_compra}-${fila.id_compra}`}>
                                                    <td data-label="Producto">{fila.producto}</td>
                                                    <td data-label="Pedido">{formatMoney(fila.precio_pedido)}</td>
                                                    <td data-label="Recibido">{formatMoney(fila.precio_recibido ?? fila.precio_pedido)}</td>
                                                    <td data-label="Solicitado">{fila.cantidad_solicitada}</td>
                                                    <td data-label="Recibido">{fila.cantidad_recibida}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
