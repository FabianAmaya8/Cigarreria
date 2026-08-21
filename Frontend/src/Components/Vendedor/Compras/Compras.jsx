import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Loading, Error } from "../../../Utils/Components/Cargando";
import {
    useActualizarCompra,
    useAbonarCompensacion,
    useAlertasCompra,
    useBolsillosCompra,
    useCajasCompra,
    useCompra,
    useCompras,
    useCompensacionesPendientes,
    useCrearCompra,
    useCrearCompensacion,
    useProductosCompra,
    useRecibirCompra,
    useRegistrarDevolucionCompra,
    useRegistrarPagoCompra,
} from "../../../Hooks/Vendedor/Compras/useCompras";
import { useProveedores } from "../../../Hooks/Vendedor/Proveedores/useProveedores";
import styles from "../../../assets/Css/Vendedor/ComprasProveedores.module.scss";

function formatMoney(value) {
    const numeric = Number(value || 0);
    return `$ ${numeric.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-CO");
}

function getEntityName(entity, fallback = "Sin nombre") {
    return entity?.nombre || entity?.nombre_caja || entity?.nombre_bolsillo || entity?.descripcion || entity?.caja || entity?.bolsillo || fallback;
}

function getEntityId(entity, kind) {
    if (!entity) return "";
    if (kind === "caja") return entity.id_caja ?? entity.id ?? "";
    if (kind === "bolsillo") return entity.id_bolsillo ?? entity.id ?? "";
    return entity.id ?? "";
}

function getProveedorNombre(compra) {
    if (!compra) return "—";
    if (typeof compra.proveedor === "string") return compra.proveedor;
    return compra.proveedor?.nombre || "—";
}

function ModalShell({ open, title, subtitle, onClose, children, narrow = false }) {
    if (!open) return null;
    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={`${styles.modal} ${narrow ? styles.modalNarrow : ""}`} onClick={(event) => event.stopPropagation()}>
                <header className={styles.modalHeader}>
                    <div>
                        <span className={styles.kicker}>Compras y proveedores</span>
                        <h3 className={styles.modalTitle}>{title}</h3>
                        {subtitle ? <p className={styles.modalSub}>{subtitle}</p> : null}
                    </div>
                    <button type="button" className={styles.button} onClick={onClose} aria-label="Cerrar modal">
                        <i className="bx bx-x" />
                    </button>
                </header>
                {children}
            </div>
        </div>
    );
}

function CompraDetalleModal({ open, compra, alertas = [], onClose, onEdit, onReceive, onPay, onReturn, onCompensate }) {
    if (!open || !compra) return null;

    return (
        <ModalShell
            open={open}
            title={`Compra #${compra.id_compra}`}
            subtitle={`Proveedor: ${getProveedorNombre(compra)} | Factura: ${compra.numero_factura || "Sin factura"}`}
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
                            <span className={`${styles.badge} ${styles.badgeWarning}`}>{alertas.length}</span>
                        </div>
                        <div className={styles.stack}>
                            {alertas.map((alerta, index) => (
                                <div key={`${alerta.tipo}-${index}`} className={`${styles.alert} ${alerta.severidad === "error" ? styles.alertDanger : styles.alertInfo}`}>
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
                        <span>Recepción: {compra.estado_recepcion}</span>
                        <span>Pago: {compra.estado_pago}</span>
                    </article>
                    <article className={styles.detailCard}>
                        <strong>Totales</strong>
                        <span>Total: {formatMoney(compra.total)}</span>
                        <span>Pagado: {formatMoney(compra.total_pagado)}</span>
                        <span>Saldo: {formatMoney(compra.saldo_pendiente)}</span>
                    </article>
                    <article className={styles.detailCard}>
                        <strong>Fechas</strong>
                        <span>Pedido: {formatDate(compra.fecha_pedido)}</span>
                        <span>Recepción: {formatDate(compra.fecha_recepcion)}</span>
                    </article>
                    <article className={styles.detailCard}>
                        <strong>Factura y notas</strong>
                        <span>Factura: {compra.numero_factura || "Sin factura"}</span>
                        <span>Archivo: {compra.archivo_factura || "Sin referencia"}</span>
                        <span>Observaciones: {compra.observaciones || "Sin observaciones"}</span>
                    </article>
                </section>

                <section className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h4>Productos</h4>
                            <p>Líneas de detalle de la compra.</p>
                        </div>
                        <span className={`${styles.badge} ${styles.badgeInfo}`}>{compra.detalles?.length || 0} líneas</span>
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
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(compra.detalles || []).map((detalle) => (
                                    <tr key={detalle.id_detalle_compra}>
                                        <td data-label="Producto">
                                            <div className={styles.stack}>
                                                <strong>{detalle.producto?.nombre || `Producto ${detalle.id_producto}`}</strong>
                                                <span className={styles.muted}>{detalle.producto?.codigo_barras || "Sin código"}</span>
                                            </div>
                                        </td>
                                        <td data-label="Cant. pedida">{detalle.cantidad_solicitada}</td>
                                        <td data-label="Cant. recibida">{detalle.cantidad_recibida}</td>
                                        <td data-label="Precio pedido">{formatMoney(detalle.precio_pedido)}</td>
                                        <td data-label="Precio recibido">{formatMoney(detalle.precio_recibido ?? detalle.precio_pedido)}</td>
                                        <td data-label="Estado">
                                            <span className={`${styles.badge} ${detalle.estado === "completo" ? styles.badgeActive : detalle.estado === "parcial" ? styles.badgeWarning : styles.badgeInactive}`}>{detalle.estado}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className={styles.inlineActions}>
                    {!compra.fecha_recepcion ? <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onEdit}>Editar</button> : null}
                    {!compra.fecha_recepcion ? <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} onClick={onReceive}>Recibir compra</button> : null}
                    {Number(compra.saldo_pendiente || 0) > 0 ? <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={onPay}>Registrar pago</button> : null}
                    {compra.fecha_recepcion ? <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onReturn}>Registrar devolución</button> : null}
                    <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onCompensate}>Crear compensación</button>
                </div>
            </div>
        </ModalShell>
    );
}
function CompraFormModal({ open, mode, initialCompra, proveedores = [], productos = [], onClose, onSubmit, isSubmitting }) {
    const [form, setForm] = useState({ id_proveedor: "", numero_factura: "", archivo_factura: "", observaciones: "" });
    const [detalles, setDetalles] = useState([{ id_producto: "", cantidad_solicitada: 1, precio_pedido: "" }]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setError("");
        setForm({
            id_proveedor: initialCompra?.proveedor?.id_proveedor || initialCompra?.id_proveedor || "",
            numero_factura: initialCompra?.numero_factura || "",
            archivo_factura: initialCompra?.archivo_factura || "",
            observaciones: initialCompra?.observaciones || "",
        });
        setDetalles(
            mode === "create"
                ? (initialCompra?.detalles?.length
                    ? initialCompra.detalles.map((detalle) => ({
                        id_producto: detalle.id_producto || detalle.producto?.id_producto || "",
                        cantidad_solicitada: detalle.cantidad_solicitada || 1,
                        precio_pedido: detalle.precio_pedido || "",
                    }))
                    : [{ id_producto: "", cantidad_solicitada: 1, precio_pedido: "" }])
                : [],
        );
    }, [open, mode, initialCompra]);

    function updateForm(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function updateDetalle(index, field, value) {
        setDetalles((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
    }

    function addDetalle() {
        setDetalles((current) => [...current, { id_producto: "", cantidad_solicitada: 1, precio_pedido: "" }]);
    }

    function removeDetalle(index) {
        setDetalles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const idProveedor = Number(form.id_proveedor || 0);
        if (!idProveedor) {
            setError("Debes seleccionar un proveedor.");
            return;
        }

        if (mode === "create") {
            const lineas = detalles.filter((item) => item.id_producto && Number(item.cantidad_solicitada) > 0 && Number(item.precio_pedido) > 0);
            if (!lineas.length) {
                setError("Agrega al menos una línea válida.");
                return;
            }

            try {
                await onSubmit({
                    id_proveedor: idProveedor,
                    numero_factura: form.numero_factura.trim() || null,
                    archivo_factura: form.archivo_factura.trim() || null,
                    observaciones: form.observaciones.trim() || null,
                    detalles: lineas.map((item) => ({
                        id_producto: Number(item.id_producto),
                        cantidad_solicitada: Number(item.cantidad_solicitada),
                        precio_pedido: Number(item.precio_pedido),
                    })),
                });
                onClose();
            } catch (submissionError) {
                setError(submissionError?.message || "No se pudo crear la compra.");
            }
            return;
        }

        try {
            await onSubmit({
                id_proveedor: idProveedor,
                numero_factura: form.numero_factura.trim() || null,
                archivo_factura: form.archivo_factura.trim() || null,
                observaciones: form.observaciones.trim() || null,
            });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo actualizar la compra.");
        }
    }

    if (!open) return null;

    return (
        <ModalShell
            open={open}
            title={mode === "create" ? "Nueva compra" : `Editar compra #${initialCompra?.id_compra}`}
            subtitle={mode === "create" ? "Registra la orden con productos y cantidades." : "Actualiza los datos generales antes de la recepción."}
            onClose={onClose}
        >
            <form className={styles.modalBody} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Proveedor</span>
                        <select className={styles.fieldSelect} value={form.id_proveedor} onChange={(event) => updateForm("id_proveedor", event.target.value)}>
                            <option value="">Selecciona un proveedor</option>
                            {(proveedores || []).map((proveedor) => (
                                <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>{proveedor.nombre}</option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Número de factura</span>
                        <input className={styles.fieldInput} value={form.numero_factura} onChange={(event) => updateForm("numero_factura", event.target.value)} placeholder="Opcional" />
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Archivo o referencia</span>
                        <input className={styles.fieldInput} value={form.archivo_factura} onChange={(event) => updateForm("archivo_factura", event.target.value)} placeholder="Nombre del archivo o enlace" />
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Subir archivo local</span>
                        <input className={styles.fieldInput} type="file" onChange={(event) => updateForm("archivo_factura", event.target.files?.[0]?.name || "")} />
                    </label>
                    <label className={`${styles.field} ${styles.full}`}>
                        <span className={styles.fieldLabel}>Observaciones</span>
                        <textarea className={styles.fieldTextarea} rows="3" value={form.observaciones} onChange={(event) => updateForm("observaciones", event.target.value)} />
                    </label>
                </div>

                {mode === "create" ? (
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h4>Productos</h4>
                                <p>Agrega cada producto con su cantidad y precio pedido.</p>
                            </div>
                            <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={addDetalle}>
                                <i className="bx bx-plus" /> Agregar línea
                            </button>
                        </div>

                        <div className={styles.lineList}>
                            {detalles.map((detalle, index) => (
                                <div key={`${index}-${detalle.id_producto || "nuevo"}`} className={styles.lineItem}>
                                    <label className={styles.miniField}>
                                        <span className={styles.miniFieldLabel}>Producto</span>
                                        <select className={styles.miniFieldSelect} value={detalle.id_producto} onChange={(event) => updateDetalle(index, "id_producto", event.target.value)}>
                                            <option value="">Selecciona</option>
                                            {(productos || []).map((producto) => (
                                                <option key={producto.id_producto} value={producto.id_producto}>{producto.nombre}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className={styles.miniField}>
                                        <span className={styles.miniFieldLabel}>Cantidad</span>
                                        <input className={styles.miniFieldInput} type="number" min="1" value={detalle.cantidad_solicitada} onChange={(event) => updateDetalle(index, "cantidad_solicitada", event.target.value)} />
                                    </label>
                                    <label className={styles.miniField}>
                                        <span className={styles.miniFieldLabel}>Precio pedido</span>
                                        <input className={styles.miniFieldInput} type="number" min="0" step="0.01" value={detalle.precio_pedido} onChange={(event) => updateDetalle(index, "precio_pedido", event.target.value)} />
                                    </label>
                                    <div className={styles.lineActions}>
                                        <button type="button" className={`${styles.button} ${styles.buttonDangerGhost} ${styles.buttonSmall}`} onClick={() => removeDetalle(index)} disabled={detalles.length === 1}>Quitar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h4>Compra sin recepción</h4>
                                <p>Solo puedes editar los datos generales.</p>
                            </div>
                            <span className={`${styles.badge} ${styles.badgeWarning}`}>Edición limitada</span>
                        </div>
                    </section>
                )}

                {error ? <p className={`${styles.alert} ${styles.alertDanger}`}>{error}</p> : null}
                <footer className={styles.modalFooter}>
                    <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isSubmitting}>{isSubmitting ? "Guardando..." : mode === "create" ? "Crear compra" : "Actualizar compra"}</button>
                </footer>
            </form>
        </ModalShell>
    );
}

function RecepcionModal({ open, compra, onClose, onSubmit, isSubmitting }) {
    const [detalles, setDetalles] = useState([]);
    const [observaciones, setObservaciones] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !compra) return;
        setObservaciones("");
        setError("");
        setDetalles((compra.detalles || []).map((detalle) => ({ id_detalle_compra: detalle.id_detalle_compra, cantidad_recibida: detalle.cantidad_solicitada || 0, precio_recibido: detalle.precio_pedido || "" })));
    }, [open, compra]);

    function updateDetalle(index, field, value) {
        setDetalles((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        try {
            await onSubmit({
                detalles: detalles.map((item) => ({
                    id_detalle_compra: item.id_detalle_compra,
                    cantidad_recibida: Number(item.cantidad_recibida || 0),
                    precio_recibido: item.precio_recibido === "" ? null : Number(item.precio_recibido),
                })),
                observaciones: observaciones.trim() || null,
            });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo registrar la recepción.");
        }
    }

    if (!open || !compra) return null;

    return (
        <ModalShell open={open} title={`Recepción compra #${compra.id_compra}`} subtitle="Captura las cantidades recibidas y los precios finales." onClose={onClose}>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
                <div className={styles.lineList}>
                    {(compra.detalles || []).map((detalle, index) => (
                        <div key={detalle.id_detalle_compra} className={`${styles.lineItem} ${styles.lineItemCompact}`}>
                            <div className={styles.lineMain}>
                                <strong>{detalle.producto?.nombre || `Producto ${detalle.id_producto}`}</strong>
                                <span>{detalle.cantidad_solicitada} solicitados | {formatMoney(detalle.precio_pedido)}</span>
                            </div>
                            <label className={styles.miniField}>
                                <span className={styles.miniFieldLabel}>Recibido</span>
                                <input className={styles.miniFieldInput} type="number" min="0" max={detalle.cantidad_solicitada} value={detalles[index]?.cantidad_recibida ?? 0} onChange={(event) => updateDetalle(index, "cantidad_recibida", event.target.value)} />
                            </label>
                            <label className={styles.miniField}>
                                <span className={styles.miniFieldLabel}>Precio recibido</span>
                                <input className={styles.miniFieldInput} type="number" min="0" step="0.01" value={detalles[index]?.precio_recibido ?? ""} onChange={(event) => updateDetalle(index, "precio_recibido", event.target.value)} />
                            </label>
                        </div>
                    ))}
                </div>
                <label className={`${styles.field} ${styles.full}`}>
                    <span className={styles.fieldLabel}>Observaciones</span>
                    <textarea className={styles.fieldTextarea} rows="3" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} />
                </label>
                {error ? <p className={`${styles.alert} ${styles.alertDanger}`}>{error}</p> : null}
                <footer className={styles.modalFooter}>
                    <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar recepción"}</button>
                </footer>
            </form>
        </ModalShell>
    );
}

function PagoModal({ open, compra, cajas = [], bolsillos = [], onClose, onSubmit, isSubmitting }) {
    const [form, setForm] = useState({ tipo_origen: "caja", id_origen: "", id_caja: "", monto: "", observaciones: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !compra) return;
        const firstCaja = cajas[0];
        setForm({
            tipo_origen: "caja",
            id_origen: firstCaja ? String(getEntityId(firstCaja, "caja")) : "",
            id_caja: firstCaja ? String(getEntityId(firstCaja, "caja")) : "",
            monto: String(compra.saldo_pendiente || compra.total || 0),
            observaciones: "",
        });
        setError("");
    }, [open, compra, cajas]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        const monto = Number(form.monto || 0);
        if (monto <= 0) {
            setError("El monto debe ser mayor a cero.");
            return;
        }
        if (!form.id_origen) {
            setError("Selecciona una fuente de pago.");
            return;
        }
        try {
            await onSubmit({
                monto,
                observaciones: form.observaciones.trim() || null,
                origenes: [{
                    tipo_origen: form.tipo_origen,
                    id_origen: Number(form.id_origen),
                    monto,
                    id_caja: form.id_caja ? Number(form.id_caja) : null,
                    observaciones: form.observaciones.trim() || null,
                }],
            });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo registrar el pago.");
        }
    }

    if (!open || !compra) return null;

    const sourceList = form.tipo_origen === "caja" ? cajas : bolsillos;

    return (
        <ModalShell open={open} title={`Pago compra #${compra.id_compra}`} subtitle={`Saldo pendiente: ${formatMoney(compra.saldo_pendiente)}`} onClose={onClose} narrow>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Tipo de origen</span>
                        <select className={styles.fieldSelect} value={form.tipo_origen} onChange={(event) => {
                            const nextType = event.target.value;
                            const first = (nextType === "caja" ? cajas : bolsillos)[0];
                            setForm((current) => ({
                                ...current,
                                tipo_origen: nextType,
                                id_origen: first ? String(getEntityId(first, nextType)) : "",
                                id_caja: cajas[0] ? String(getEntityId(cajas[0], "caja")) : "",
                            }));
                        }}>
                            <option value="caja">Caja</option>
                            <option value="bolsillo">Bolsillo</option>
                        </select>
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>{form.tipo_origen === "caja" ? "Caja" : "Bolsillo"}</span>
                        <select className={styles.fieldSelect} value={form.id_origen} onChange={(event) => setForm((current) => ({ ...current, id_origen: event.target.value }))}>
                            <option value="">Selecciona</option>
                            {(sourceList || []).map((item) => (
                                <option key={getEntityId(item, form.tipo_origen)} value={getEntityId(item, form.tipo_origen)}>{getEntityName(item)}</option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Caja soporte</span>
                        <select className={styles.fieldSelect} value={form.id_caja} onChange={(event) => setForm((current) => ({ ...current, id_caja: event.target.value }))}>
                            <option value="">Selecciona</option>
                            {(cajas || []).map((caja) => (
                                <option key={caja.id_caja} value={caja.id_caja}>{getEntityName(caja, `Caja ${caja.id_caja}`)}</option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Monto</span>
                        <input className={styles.fieldInput} type="number" min="0" step="0.01" value={form.monto} onChange={(event) => setForm((current) => ({ ...current, monto: event.target.value }))} />
                    </label>
                </div>
                <label className={`${styles.field} ${styles.full}`}>
                    <span className={styles.fieldLabel}>Observaciones</span>
                    <textarea className={styles.fieldTextarea} rows="3" value={form.observaciones} onChange={(event) => setForm((current) => ({ ...current, observaciones: event.target.value }))} />
                </label>
                {error ? <p className={`${styles.alert} ${styles.alertDanger}`}>{error}</p> : null}
                <footer className={styles.modalFooter}>
                    <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar pago"}</button>
                </footer>
            </form>
        </ModalShell>
    );
}
function DevolucionModal({ open, compra, onClose, onSubmit, isSubmitting }) {
    const [detalles, setDetalles] = useState([]);
    const [motivo, setMotivo] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !compra) return;
        setMotivo("");
        setObservaciones("");
        setError("");
        setDetalles((compra.detalles || []).map((detalle) => ({ id_detalle_compra: detalle.id_detalle_compra, cantidad: 0, motivo: "" })));
    }, [open, compra]);

    function updateDetalle(index, field, value) {
        setDetalles((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        const payloadDetalles = detalles.filter((item) => Number(item.cantidad || 0) > 0).map((item) => ({
            id_detalle_compra: item.id_detalle_compra,
            cantidad: Number(item.cantidad || 0),
            motivo: item.motivo.trim() || motivo.trim() || null,
        }));
        if (!payloadDetalles.length) {
            setError("Debes indicar al menos una cantidad a devolver.");
            return;
        }
        try {
            await onSubmit({ motivo: motivo.trim() || null, observaciones: observaciones.trim() || null, detalles: payloadDetalles });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo registrar la devolución.");
        }
    }

    if (!open || !compra) return null;

    return (
        <ModalShell open={open} title={`Devolución compra #${compra.id_compra}`} subtitle="Registra cantidades devueltas por línea de producto." onClose={onClose}>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Motivo general</span>
                    <input className={styles.fieldInput} value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Ej. producto averiado" />
                </label>
                <div className={styles.lineList}>
                    {(compra.detalles || []).map((detalle, index) => (
                        <div key={detalle.id_detalle_compra} className={`${styles.lineItem} ${styles.lineItemCompact}`}>
                            <div className={styles.lineMain}>
                                <strong>{detalle.producto?.nombre || `Producto ${detalle.id_producto}`}</strong>
                                <span>Recibido: {detalle.cantidad_recibida} | {formatMoney(detalle.precio_recibido ?? detalle.precio_pedido)}</span>
                            </div>
                            <label className={styles.miniField}>
                                <span className={styles.miniFieldLabel}>Cantidad</span>
                                <input className={styles.miniFieldInput} type="number" min="0" max={detalle.cantidad_recibida || 0} value={detalles[index]?.cantidad ?? 0} onChange={(event) => updateDetalle(index, "cantidad", event.target.value)} />
                            </label>
                            <label className={styles.miniField}>
                                <span className={styles.miniFieldLabel}>Motivo</span>
                                <input className={styles.miniFieldInput} value={detalles[index]?.motivo ?? ""} onChange={(event) => updateDetalle(index, "motivo", event.target.value)} placeholder="Opcional" />
                            </label>
                        </div>
                    ))}
                </div>
                <label className={`${styles.field} ${styles.full}`}>
                    <span className={styles.fieldLabel}>Observaciones</span>
                    <textarea className={styles.fieldTextarea} rows="3" value={observaciones} onChange={(event) => setObservaciones(event.target.value)} />
                </label>
                {error ? <p className={`${styles.alert} ${styles.alertDanger}`}>{error}</p> : null}
                <footer className={styles.modalFooter}>
                    <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar devolución"}</button>
                </footer>
            </form>
        </ModalShell>
    );
}

function CompensacionModal({ open, cajas = [], bolsillos = [], onClose, onSubmit, isSubmitting, initialData = {} }) {
    const [form, setForm] = useState({ id_caja: "", id_bolsillo: "", monto_original: "", observaciones: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setForm({
            id_caja: initialData.id_caja || (cajas[0] ? String(cajas[0].id_caja) : ""),
            id_bolsillo: initialData.id_bolsillo || (bolsillos[0] ? String(bolsillos[0].id_bolsillo) : ""),
            monto_original: initialData.monto_original || "",
            observaciones: initialData.observaciones || "",
        });
        setError("");
    }, [open, initialData, cajas, bolsillos]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        const monto = Number(form.monto_original || 0);
        if (!form.id_caja || !form.id_bolsillo) {
            setError("Selecciona una caja y un bolsillo.");
            return;
        }
        if (monto <= 0) {
            setError("El monto debe ser mayor a cero.");
            return;
        }
        try {
            await onSubmit({
                id_caja: Number(form.id_caja),
                id_bolsillo: Number(form.id_bolsillo),
                monto_original: monto,
                observaciones: form.observaciones.trim() || null,
                id_compra: initialData.id_compra || null,
                id_pago_compra: initialData.id_pago_compra || null,
            });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo crear la compensación.");
        }
    }

    if (!open) return null;

    return (
        <ModalShell open={open} title="Nueva compensación" subtitle="Mueve saldo entre caja y bolsillo." onClose={onClose} narrow>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Caja</span>
                        <select className={styles.fieldSelect} value={form.id_caja} onChange={(event) => setForm((current) => ({ ...current, id_caja: event.target.value }))}>
                            <option value="">Selecciona</option>
                            {(cajas || []).map((caja) => <option key={caja.id_caja} value={caja.id_caja}>{getEntityName(caja, `Caja ${caja.id_caja}`)}</option>)}
                        </select>
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Bolsillo</span>
                        <select className={styles.fieldSelect} value={form.id_bolsillo} onChange={(event) => setForm((current) => ({ ...current, id_bolsillo: event.target.value }))}>
                            <option value="">Selecciona</option>
                            {(bolsillos || []).map((bolsillo) => <option key={bolsillo.id_bolsillo} value={bolsillo.id_bolsillo}>{getEntityName(bolsillo, `Bolsillo ${bolsillo.id_bolsillo}`)}</option>)}
                        </select>
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Monto original</span>
                        <input className={styles.fieldInput} type="number" min="0" step="0.01" value={form.monto_original} onChange={(event) => setForm((current) => ({ ...current, monto_original: event.target.value }))} />
                    </label>
                    <label className={`${styles.field} ${styles.full}`}>
                        <span className={styles.fieldLabel}>Observaciones</span>
                        <textarea className={styles.fieldTextarea} rows="3" value={form.observaciones} onChange={(event) => setForm((current) => ({ ...current, observaciones: event.target.value }))} />
                    </label>
                </div>
                {error ? <p className={`${styles.alert} ${styles.alertDanger}`}>{error}</p> : null}
                <footer className={styles.modalFooter}>
                    <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Crear compensación"}</button>
                </footer>
            </form>
        </ModalShell>
    );
}

function AbonoCompensacionModal({ open, compensacion, onClose, onSubmit, isSubmitting }) {
    const [monto, setMonto] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open || !compensacion) return;
        setMonto(String(compensacion.monto_pendiente || 0));
        setError("");
    }, [open, compensacion]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        const numeric = Number(monto || 0);
        if (numeric <= 0) {
            setError("El monto debe ser mayor a cero.");
            return;
        }
        try {
            await onSubmit({ idCompensacion: compensacion.id_compensacion, monto: numeric });
            onClose();
        } catch (submissionError) {
            setError(submissionError?.message || "No se pudo abonar la compensación.");
        }
    }

    if (!open || !compensacion) return null;

    return (
        <ModalShell open={open} title={`Abonar compensación #${compensacion.id_compensacion}`} subtitle={`Pendiente: ${formatMoney(compensacion.monto_pendiente)}`} onClose={onClose} narrow>
            <form className={styles.modalBody} onSubmit={handleSubmit}>
                <div className={styles.detailGrid}>
                    <article className={styles.detailCard}><strong>Caja</strong><span>{compensacion.caja || `Caja ${compensacion.id_caja}`}</span></article>
                    <article className={styles.detailCard}><strong>Bolsillo</strong><span>{compensacion.bolsillo || `Bolsillo ${compensacion.id_bolsillo}`}</span></article>
                    <article className={styles.detailCard}><strong>Estado</strong><span>{compensacion.estado}</span></article>
                    <article className={styles.detailCard}><strong>Original</strong><span>{formatMoney(compensacion.monto_original)}</span></article>
                </div>
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Monto a abonar</span>
                    <input className={styles.fieldInput} type="number" min="0" step="0.01" value={monto} onChange={(event) => setMonto(event.target.value)} />
                </label>
                {error ? <p className={`${styles.alert} ${styles.alertDanger}`}>{error}</p> : null}
                <footer className={styles.modalFooter}>
                    <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`} disabled={isSubmitting}>{isSubmitting ? "Abonando..." : "Abonar"}</button>
                </footer>
            </form>
        </ModalShell>
    );
}
export default function Compras() {
    const [busqueda, setBusqueda] = useState("");
    const [idProveedor, setIdProveedor] = useState("");
    const [estadoPago, setEstadoPago] = useState("");
    const [estadoRecepcion, setEstadoRecepcion] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [modoForm, setModoForm] = useState("create");
    const [compraEditar, setCompraEditar] = useState(null);
    const [compraDetalleId, setCompraDetalleId] = useState(null);
    const [compraRecepcion, setCompraRecepcion] = useState(null);
    const [compraPago, setCompraPago] = useState(null);
    const [compraDevolucion, setCompraDevolucion] = useState(null);
    const [openCompensacion, setOpenCompensacion] = useState(false);
    const [compensacionAbono, setCompensacionAbono] = useState(null);

    const filtros = useMemo(() => ({ id_proveedor: idProveedor || undefined, estado_pago: estadoPago || undefined, estado_recepcion: estadoRecepcion || undefined }), [idProveedor, estadoPago, estadoRecepcion]);
    const { data: compras, isLoading, error } = useCompras(filtros);
    const { data: proveedores } = useProveedores({});
    const { data: productos } = useProductosCompra();
    const { data: cajas } = useCajasCompra();
    const { data: bolsillos } = useBolsillosCompra();
    const { data: compensacionesPendientes } = useCompensacionesPendientes();

    const compraDetalleQuery = useCompra(compraDetalleId, Boolean(compraDetalleId));
    const alertasQuery = useAlertasCompra(compraDetalleId, Boolean(compraDetalleId));
    const crearCompra = useCrearCompra();
    const actualizarCompra = useActualizarCompra();
    const recibirCompra = useRecibirCompra();
    const registrarPagoCompra = useRegistrarPagoCompra();
    const registrarDevolucionCompra = useRegistrarDevolucionCompra();
    const crearCompensacion = useCrearCompensacion();
    const abonarCompensacion = useAbonarCompensacion();

    const compraDetalle = compraDetalleQuery.data || compras?.find((item) => item.id_compra === compraDetalleId) || null;
    const comprasFiltradas = useMemo(() => {
        const term = busqueda.trim().toLowerCase();
        return (compras || []).filter((compra) => !term || String(compra.numero_factura || "").toLowerCase().includes(term) || String(compra.id_compra).includes(term) || getProveedorNombre(compra).toLowerCase().includes(term));
    }, [compras, busqueda]);
    const stats = useMemo(() => {
        const lista = Array.isArray(compras) ? compras : [];
        return {
            total: lista.length,
            pendientesPago: lista.filter((item) => item.estado_pago !== "pagada").length,
            pendientesRecepcion: lista.filter((item) => item.estado_recepcion === "pendiente").length,
            saldoPendiente: lista.reduce((acc, item) => acc + Number(item.saldo_pendiente || 0), 0),
        };
    }, [compras]);

    async function handleCrearCompra(payload) { await crearCompra.mutateAsync(payload); Swal.fire("Compra creada", "La orden fue registrada correctamente.", "success"); }
    async function handleActualizarCompra(payload) { await actualizarCompra.mutateAsync({ idCompra: compraEditar.id_compra, data: payload }); Swal.fire("Compra actualizada", "Los datos generales fueron actualizados.", "success"); }
    async function handleRecepcion(payload) { await recibirCompra.mutateAsync({ idCompra: compraRecepcion.id_compra, data: payload }); Swal.fire("Recepción registrada", "La compra fue recibida correctamente.", "success"); }
    async function handlePago(payload) { await registrarPagoCompra.mutateAsync({ idCompra: compraPago.id_compra, data: payload }); Swal.fire("Pago registrado", "El pago quedó guardado.", "success"); }
    async function handleDevolucion(payload) { await registrarDevolucionCompra.mutateAsync({ idCompra: compraDevolucion.id_compra, data: payload }); Swal.fire("Devolución registrada", "La devolución quedó guardada.", "success"); }
    async function handleCompensacion(payload) { await crearCompensacion.mutateAsync(payload); Swal.fire("Compensación creada", "La compensación quedó registrada.", "success"); }
    async function handleAbono(payload) { await abonarCompensacion.mutateAsync(payload); Swal.fire("Abono registrado", "La compensación fue abonada.", "success"); }

    if (isLoading) return <Loading />;
    if (error) return <Error msg={error.message || "No se pudieron cargar las compras"} />;

    return (
        <main className={styles.pageShell}>
            <section className={styles.hero}>
                <div className={styles.heroTitle}>
                    <span className={styles.kicker}>Compras y proveedores</span>
                    <h2>Gestión de Compras</h2>
                    <p>Registra órdenes, recepciones, pagos, devoluciones y compensaciones con trazabilidad completa.</p>
                </div>
                <div className={styles.heroActions}>
                    <button type="button" className={`${styles.button} ${styles.buttonPrimary}`} onClick={() => { setModoForm("create"); setCompraEditar(null); setOpenForm(true); }}><i className="bx bx-plus" /> Nueva compra</button>
                    <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setOpenCompensacion(true)}><i className="bx bx-transfer" /> Nueva compensación</button>
                </div>
            </section>

            <section className={styles.toolbar}>
                <label className={styles.field}><span className={styles.fieldLabel}>Buscar</span><input className={styles.fieldInput} type="search" placeholder="Factura, proveedor o ID" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} /></label>
                <label className={styles.field}><span className={styles.fieldLabel}>Proveedor</span><select className={styles.fieldSelect} value={idProveedor} onChange={(event) => setIdProveedor(event.target.value)}><option value="">Todos</option>{(proveedores || []).map((proveedor) => <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>{proveedor.nombre}</option>)}</select></label>
                <label className={styles.field}><span className={styles.fieldLabel}>Pago</span><select className={styles.fieldSelect} value={estadoPago} onChange={(event) => setEstadoPago(event.target.value)}><option value="">Todos</option><option value="pendiente">Pendiente</option><option value="parcial">Parcial</option><option value="pagada">Pagada</option></select></label>
                <label className={styles.field}><span className={styles.fieldLabel}>Recepción</span><select className={styles.fieldSelect} value={estadoRecepcion} onChange={(event) => setEstadoRecepcion(event.target.value)}><option value="">Todos</option><option value="pendiente">Pendiente</option><option value="parcial">Parcial</option><option value="completa">Completa</option></select></label>
            </section>

            <section className={styles.statGrid}>
                <article className={styles.statCard}><span>Total compras</span><strong>{stats.total}</strong></article>
                <article className={styles.statCard}><span>Pendientes de pago</span><strong>{stats.pendientesPago}</strong></article>
                <article className={styles.statCard}><span>Pendientes de recepción</span><strong>{stats.pendientesRecepcion}</strong></article>
                <article className={styles.statCard}><span>Saldo pendiente</span><strong>{formatMoney(stats.saldoPendiente)}</strong></article>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div><h3>Listado de compras</h3><p>Usa los botones de acción para avanzar cada compra por su ciclo completo.</p></div>
                    <span className={`${styles.badge} ${styles.badgeInfo}`}>{comprasFiltradas.length} registros</span>
                </div>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead><tr><th>Factura</th><th>Proveedor</th><th>Estados</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Fecha</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {comprasFiltradas.map((compra) => (
                                <tr key={compra.id_compra}>
                                    <td data-label="Factura"><div className={styles.stack}><strong>{compra.numero_factura || `Compra #${compra.id_compra}`}</strong><span className={styles.muted}>{compra.archivo_factura || "Sin archivo"}</span></div></td>
                                    <td data-label="Proveedor">{getProveedorNombre(compra)}</td>
                                    <td data-label="Estados"><div className={styles.stack}><span className={`${styles.badge} ${styles.badgeInfo}`}>{compra.estado_pedido}</span><span className={`${styles.badge} ${compra.estado_recepcion === "completa" ? styles.badgeActive : compra.estado_recepcion === "parcial" ? styles.badgeWarning : styles.badgeInactive}`}>{compra.estado_recepcion}</span><span className={`${styles.badge} ${compra.estado_pago === "pagada" ? styles.badgeActive : compra.estado_pago === "parcial" ? styles.badgeWarning : styles.badgeInactive}`}>{compra.estado_pago}</span></div></td>
                                    <td data-label="Total">{formatMoney(compra.total)}</td>
                                    <td data-label="Pagado">{formatMoney(compra.total_pagado)}</td>
                                    <td data-label="Saldo">{formatMoney(compra.saldo_pendiente)}</td>
                                    <td data-label="Fecha">{formatDate(compra.fecha_pedido)}</td>
                                    <td data-label="Acciones"><div className={styles.inlineActions}><button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => setCompraDetalleId(compra.id_compra)}>Ver</button>{!compra.fecha_recepcion ? <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => { setModoForm("edit"); setCompraEditar(compra); setOpenForm(true); }}>Editar</button> : null}{!compra.fecha_recepcion ? <button type="button" className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`} onClick={() => setCompraRecepcion(compra)}>Recibir</button> : null}{Number(compra.saldo_pendiente || 0) > 0 ? <button type="button" className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`} onClick={() => setCompraPago(compra)}>Pagar</button> : null}{compra.fecha_recepcion ? <button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => setCompraDevolucion(compra)}>Devolver</button> : null}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className={styles.splitGrid}>
                <article className={styles.section}>
                    <div className={styles.sectionHeader}><div><h3>Compensaciones pendientes</h3><p>Abona o revisa los movimientos creados desde compras.</p></div><span className={`${styles.badge} ${styles.badgeWarning}`}>{(compensacionesPendientes || []).length}</span></div>
                    <div className={styles.lineList}>
                        {(compensacionesPendientes || []).map((compensacion) => (
                            <div key={compensacion.id_compensacion} className={`${styles.lineItem} ${styles.lineItemCompact}`}>
                                <div className={styles.lineMain}><strong>{compensacion.caja || `Caja ${compensacion.id_caja}`}</strong><span>{compensacion.bolsillo || `Bolsillo ${compensacion.id_bolsillo}`}</span></div>
                                <div className={styles.lineMain}><strong>{formatMoney(compensacion.monto_original)}</strong><span>Abonado: {formatMoney(compensacion.monto_compensado)}</span></div>
                                <div className={styles.lineMain}><strong>Saldo</strong><span>{formatMoney(compensacion.monto_pendiente)}</span></div>
                                <div className={styles.lineActions}><button type="button" className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`} onClick={() => setCompensacionAbono(compensacion)}>Abonar</button></div>
                            </div>
                        ))}
                    </div>
                </article>
                <article className={styles.section}>
                    <div className={styles.sectionHeader}><div><h3>Resumen operativo</h3><p>Vista rápida del módulo.</p></div></div>
                    <div className={styles.cardGrid}>
                        <div className={styles.card}><h4>Productos cargados</h4><span>{(productos || []).length}</span></div>
                        <div className={styles.card}><h4>Proveedores activos</h4><span>{(proveedores || []).filter((item) => item.activo).length}</span></div>
                        <div className={styles.card}><h4>Bolsillos disponibles</h4><span>{(bolsillos || []).length}</span></div>
                        <div className={styles.card}><h4>Cajas disponibles</h4><span>{(cajas || []).length}</span></div>
                    </div>
                </article>
            </section>

            <CompraFormModal open={openForm} mode={modoForm} initialCompra={compraEditar} proveedores={proveedores || []} productos={productos || []} onClose={() => { setOpenForm(false); setCompraEditar(null); }} onSubmit={modoForm === "create" ? handleCrearCompra : handleActualizarCompra} isSubmitting={crearCompra.isPending || actualizarCompra.isPending} />
            <CompraDetalleModal open={Boolean(compraDetalleId)} compra={compraDetalle} alertas={alertasQuery.data || []} onClose={() => setCompraDetalleId(null)} onEdit={() => { setModoForm("edit"); setCompraEditar(compraDetalle); setCompraDetalleId(null); setOpenForm(true); }} onReceive={() => setCompraRecepcion(compraDetalle)} onPay={() => setCompraPago(compraDetalle)} onReturn={() => setCompraDevolucion(compraDetalle)} onCompensate={() => setOpenCompensacion(true)} />
            <RecepcionModal open={Boolean(compraRecepcion)} compra={compraRecepcion} onClose={() => setCompraRecepcion(null)} onSubmit={handleRecepcion} isSubmitting={recibirCompra.isPending} />
            <PagoModal open={Boolean(compraPago)} compra={compraPago} cajas={cajas || []} bolsillos={bolsillos || []} onClose={() => setCompraPago(null)} onSubmit={handlePago} isSubmitting={registrarPagoCompra.isPending} />
            <DevolucionModal open={Boolean(compraDevolucion)} compra={compraDevolucion} onClose={() => setCompraDevolucion(null)} onSubmit={handleDevolucion} isSubmitting={registrarDevolucionCompra.isPending} />
            <CompensacionModal open={openCompensacion} cajas={cajas || []} bolsillos={bolsillos || []} onClose={() => setOpenCompensacion(false)} onSubmit={handleCompensacion} isSubmitting={crearCompensacion.isPending} initialData={{}} />
            <AbonoCompensacionModal open={Boolean(compensacionAbono)} compensacion={compensacionAbono} onClose={() => setCompensacionAbono(null)} onSubmit={handleAbono} isSubmitting={abonarCompensacion.isPending} />
        </main>
    );
}
