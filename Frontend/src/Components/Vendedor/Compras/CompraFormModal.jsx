import { useEffect, useState } from "react";

import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

import ModalShell from "./ModalShell";

function CompraFormModal({
    open,
    mode,
    initialCompra,
    proveedores = [],
    productos = [],
    onClose,
    onSubmit,
    isSubmitting,
}) {
    const [form, setForm] = useState({
        id_proveedor: "",
        numero_factura: "",
        archivo_factura: "",
        fecha_entrega: new Date(),
        observaciones: "",
    });

    const [detalles, setDetalles] = useState([
        {
            id_producto: "",
            cantidad_solicitada: 1,
            precio_pedido: "",
        },
    ]);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;

        setError("");

        setForm({
            id_proveedor:
                initialCompra?.proveedor?.id_proveedor ||
                initialCompra?.id_proveedor ||
                "",
            numero_factura:
                initialCompra?.numero_factura || "",
            archivo_factura:
                initialCompra?.archivo_factura || "",
            fecha_entrega:
                initialCompra?.fecha_entrega || new Date(),
            observaciones:
                initialCompra?.observaciones || "",
        });

        setDetalles(
            mode === "create"
                ? initialCompra?.detalles?.length
                    ? initialCompra.detalles.map((detalle) => ({
                          id_producto:
                              detalle.id_producto ||
                              detalle.producto?.id_producto ||
                              "",
                          cantidad_solicitada:
                              detalle.cantidad_solicitada || 1,
                          precio_pedido:
                              detalle.precio_pedido || "",
                      }))
                    : [
                          {
                              id_producto: "",
                              cantidad_solicitada: 1,
                              precio_pedido: "",
                          },
                      ]
                : []
        );
    }, [open, mode, initialCompra]);

    function updateForm(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function updateDetalle(index, field, value) {
        setDetalles((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    }

    function addDetalle() {
        setDetalles((current) => [
            ...current,
            {
                id_producto: "",
                cantidad_solicitada: 1,
                precio_pedido: "",
            },
        ]);
    }

    function removeDetalle(index) {
        setDetalles((current) =>
            current.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const idProveedor = Number(
            form.id_proveedor || 0
        );

        if (!idProveedor) {
            setError("Debes seleccionar un proveedor.");
            return;
        }

        if (mode === "create") {
            const lineas = detalles.filter(
                (item) =>
                    item.id_producto &&
                    Number(item.cantidad_solicitada) > 0 &&
                    Number(item.precio_pedido) > 0
            );

            if (!lineas.length) {
                setError(
                    "Agrega al menos una línea válida."
                );
                return;
            }

            try {
                await onSubmit({
                    id_proveedor: idProveedor,
                    numero_factura:
                        form.numero_factura.trim() ||
                        null,
                    archivo_factura:
                        form.archivo_factura.trim() ||
                        null,
                    fecha_entrega:
                        form.fecha_entrega,
                    observaciones:
                        form.observaciones.trim() ||
                        null,
                    detalles: lineas.map((item) => ({
                        id_producto: Number(
                            item.id_producto
                        ),
                        cantidad_solicitada: Number(
                            item.cantidad_solicitada
                        ),
                        precio_pedido: Number(
                            item.precio_pedido
                        ),
                    })),
                });

                onClose();
            } catch (submissionError) {
                setError(
                    submissionError?.message ||
                        "No se pudo crear la compra."
                );
            }

            return;
        }

        try {
            await onSubmit({
                id_proveedor: idProveedor,
                numero_factura:
                    form.numero_factura.trim() ||
                    null,
                archivo_factura:
                    form.archivo_factura.trim() ||
                    null,
                fecha_entrega:
                    form.fecha_entrega,
                observaciones:
                    form.observaciones.trim() ||
                    null,
            });

            onClose();
        } catch (submissionError) {
            setError(
                submissionError?.message ||
                    "No se pudo actualizar la compra."
            );
        }
    }

    if (!open) return null;

    return (
        <ModalShell
            open={open}
            title={
                mode === "create"
                    ? "Nueva compra"
                    : `Editar compra #${initialCompra?.id_compra}`
            }
            subtitle={
                mode === "create"
                    ? "Registra la orden con productos y cantidades."
                    : "Actualiza los datos generales antes de la recepción."
            }
            onClose={onClose}
        >
            <form
                className={styles.modalBody}
                onSubmit={handleSubmit}
            >
                <div className={styles.formGrid}>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Proveedor
                        </span>

                        <select
                            className={styles.fieldSelect}
                            value={form.id_proveedor}
                            onChange={(event) =>
                                updateForm(
                                    "id_proveedor",
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Selecciona un proveedor
                            </option>

                            {(proveedores || []).map(
                                (proveedor) => (
                                    <option
                                        key={
                                            proveedor.id_proveedor
                                        }
                                        value={
                                            proveedor.id_proveedor
                                        }
                                    >
                                        {proveedor.nombre}
                                    </option>
                                )
                            )}
                        </select>
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Número de factura
                        </span>

                        <input
                            className={styles.fieldInput}
                            value={form.numero_factura}
                            onChange={(event) =>
                                updateForm(
                                    "numero_factura",
                                    event.target.value
                                )
                            }
                            placeholder="Opcional"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Archivo o referencia
                        </span>

                        <input
                            className={styles.fieldInput}
                            value={form.archivo_factura}
                            onChange={(event) =>
                                updateForm(
                                    "archivo_factura",
                                    event.target.value
                                )
                            }
                            placeholder="Nombre del archivo o enlace"
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Subir archivo local
                        </span>

                        <input
                            className={styles.fieldInput}
                            type="file"
                            onChange={(event) =>
                                updateForm(
                                    "archivo_factura",
                                    event.target.files?.[0]
                                        ?.name || ""
                                )
                            }
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                            Fecha de entrega
                        </span>

                        <input
                            className={styles.fieldInput}
                            type="date"
                            value={form.fecha_entrega}
                            onChange={(event) =>
                                updateForm(
                                    "fecha_entrega",
                                    event.target.value
                                )
                            }
                        />
                    </label>

                    <label
                        className={`${styles.field}`}
                    >
                        <span className={styles.fieldLabel}>
                            Observaciones
                        </span>

                        <textarea
                            className={styles.fieldTextarea}
                            rows="3"
                            value={form.observaciones}
                            onChange={(event) =>
                                updateForm(
                                    "observaciones",
                                    event.target.value
                                )
                            }
                        />
                    </label>
                </div>

                {mode === "create" ? (
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h4>Productos</h4>
                                <p>
                                    Agrega cada producto con su
                                    cantidad y precio pedido.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
                                onClick={addDetalle}
                            >
                                <i className="bx bx-plus" /> Agregar
                                línea
                            </button>
                        </div>

                        <div className={styles.lineList}>
                            {detalles.map(
                                (detalle, index) => (
                                    <div
                                        key={`${index}-${
                                            detalle.id_producto ||
                                            "nuevo"
                                        }`}
                                        className={
                                            styles.lineItem
                                        }
                                    >
                                        <label
                                            className={
                                                styles.miniField
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.miniFieldLabel
                                                }
                                            >
                                                Producto
                                            </span>

                                            <select
                                                className={
                                                    styles.miniFieldSelect
                                                }
                                                value={
                                                    detalle.id_producto
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateDetalle(
                                                        index,
                                                        "id_producto",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Selecciona
                                                </option>

                                                {(
                                                    productos ||
                                                    []
                                                ).map(
                                                    (
                                                        producto
                                                    ) => (
                                                        <option
                                                            key={
                                                                producto.id_producto
                                                            }
                                                            value={
                                                                producto.id_producto
                                                            }
                                                        >
                                                            {
                                                                producto.nombre
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </label>

                                        <label
                                            className={
                                                styles.miniField
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.miniFieldLabel
                                                }
                                            >
                                                Cantidad
                                            </span>

                                            <input
                                                className={
                                                    styles.miniFieldInput
                                                }
                                                type="number"
                                                min="1"
                                                value={
                                                    detalle.cantidad_solicitada
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateDetalle(
                                                        index,
                                                        "cantidad_solicitada",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />
                                        </label>

                                        <label
                                            className={
                                                styles.miniField
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.miniFieldLabel
                                                }
                                            >
                                                Precio pedido
                                            </span>

                                            <input
                                                className={
                                                    styles.miniFieldInput
                                                }
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    detalle.precio_pedido
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateDetalle(
                                                        index,
                                                        "precio_pedido",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />
                                        </label>

                                        <div
                                            className={
                                                styles.lineActions
                                            }
                                        >
                                            <button
                                                type="button"
                                                className={`${styles.button} ${styles.buttonDangerGhost} ${styles.buttonSmall}`}
                                                onClick={() =>
                                                    removeDetalle(
                                                        index
                                                    )
                                                }
                                                disabled={
                                                    detalles.length ===
                                                    1
                                                }
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </section>
                ) : (
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h4>Compra sin recepción</h4>
                                <p>
                                    Solo puedes editar los datos
                                    generales.
                                </p>
                            </div>

                            <span
                                className={`${styles.badge} ${styles.badgeWarning}`}
                            >
                                Edición limitada
                            </span>
                        </div>
                    </section>
                )}

                {error ? (
                    <p
                        className={`${styles.alert} ${styles.alertDanger}`}
                    >
                        {error}
                    </p>
                ) : null}

                <footer className={styles.modalFooter}>
                    <button
                        type="button"
                        className={`${styles.button} ${styles.buttonGhost}`}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Guardando..."
                            : mode === "create"
                              ? "Crear compra"
                              : "Actualizar compra"}
                    </button>
                </footer>
            </form>
        </ModalShell>
    );
}

export default CompraFormModal;