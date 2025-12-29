import { useState, useEffect, useMemo, useRef } from "react";
import {
    X,
    Barcode,
    Search,
    Package,
    AlertTriangle,
    CheckCircle,
    Info,
    Warehouse,
    ShoppingBasket,
    Tag,
    Layers
} from "lucide-react";

import styles from "../../../../assets/Css/Pos/modalProducto.module.scss";

export default function ModalProducto({
    open,
    onClose,
    productos = [],
    formatearPrecio,
}) {
    const [queryNombre, setQueryNombre] = useState("");
    const [queryCodigo, setQueryCodigo] = useState("");
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const codigoRef = useRef(null);
    const modalRef = useRef(null);

    /* ===============================
        FOCUS + RESET
    =============================== */
    useEffect(() => {
        if (open) {
            setQueryNombre("");
            setQueryCodigo("");
            setProductoSeleccionado(null);
            setTimeout(() => codigoRef.current?.focus(), 50);
        }
    }, [open]);

    /* ===============================
        CERRAR CON ESC
    =============================== */
    useEffect(() => {
        if (!open) return;

        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [open, onClose]);

    /* ===============================
        BUSCAR POR CÓDIGO EXACTO
    =============================== */
    useEffect(() => {
        if (!queryCodigo) return;

        const encontrado = productos.find(
            p => p.codigo_barras === queryCodigo
        );

        if (encontrado) {
            setProductoSeleccionado(encontrado);
        }
    }, [queryCodigo, productos]);

    const productosFiltrados = useMemo(() => {
        if (!queryNombre) return productos;
        return productos.filter(p =>
            p.nombre.toLowerCase().includes(queryNombre.toLowerCase())
        );
    }, [queryNombre, productos]);

    if (!open) return null;

    const stockCritico =
        productoSeleccionado &&
        productoSeleccionado.stock_actual <= productoSeleccionado.stock_minimo;

    /* ===============================
        CLICK AFUERA
    =============================== */
    const handleBackdropClick = (e) => {
        if (!modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    const iconoAlmacen = (nombre) =>
        nombre === "Bodega" ? (
            <Warehouse size={28} color="var(--azul-500)" />
        ) : (
            <ShoppingBasket size={28} color="var(--azul-500)" />
        );

    return (
        <div className={styles.backdrop} onMouseDown={handleBackdropClick}>
            <div
                ref={modalRef}
                className={styles.modal}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <header className={styles.header}>
                    <h3>
                        <Package size={20} />
                        Consultar producto
                    </h3>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </header>

                {/* BUSCADORES */}
                <div className={styles.searches}>
                    <div className={styles.inputIcon}>
                        <Barcode size={18} />
                        <input
                            ref={codigoRef}
                            type="text"
                            placeholder="Escanear código de barras"
                            value={queryCodigo}
                            onChange={(e) => setQueryCodigo(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputIcon}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre"
                            value={queryNombre}
                            onChange={(e) => setQueryNombre(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.content}>
                    {/* LISTA */}
                    <aside className={styles.lista}>
                        {productosFiltrados.length === 0 && (
                            <div className={styles.empty}>
                                Sin resultados
                            </div>
                        )}

                        {productosFiltrados.map((p) => (
                            <button
                                key={p.id_producto}
                                className={
                                    productoSeleccionado?.id_producto === p.id_producto
                                        ? styles.activo
                                        : ""
                                }
                                onClick={() => setProductoSeleccionado(p)}
                            >
                                {p.nombre}
                            </button>
                        ))}
                    </aside>

                    {/* DETALLE */}
                    <section className={styles.detalle}>
                        {!productoSeleccionado ? (
                            <div className={styles.placeholder}>
                                <Package size={60} />
                                Escanee o seleccione un producto
                            </div>
                        ) : (
                            <>
                                <div className={styles.topDetalle}>
                                    <div className={styles.imagen}>
                                        {productoSeleccionado.imagen ? (
                                            <img
                                                src={productoSeleccionado.imagen}
                                                alt={productoSeleccionado.nombre}
                                                loading="lazy"
                                            />
                                        ):(
                                            <i className="bx bx-image-add"></i>
                                        )}
                                    </div>

                                    {productoSeleccionado.activo ? (
                                        <span className={styles.activoBadge}>
                                            <CheckCircle size={20} />
                                            Activo
                                        </span>
                                    ) : (
                                        <span className={styles.inactivoBadge}>
                                            <AlertTriangle size={20} />
                                            Inactivo
                                        </span>
                                    )}

                                    <div className={styles.nombreCodigo}>
                                        <h4>{productoSeleccionado.nombre}</h4>

                                        <p className={styles.codigo}>
                                            <Barcode size={14} />
                                            {productoSeleccionado.codigo_barras}
                                        </p>

                                        <p className={styles.descripcion}>
                                            <Info size={14} />
                                            {productoSeleccionado.descripcion}
                                        </p>
                                    </div>
                                </div>


                                <div className={styles.info}>
                                    <span>
                                        <Tag size={14} />
                                        Venta: {formatearPrecio(productoSeleccionado.precio_venta)}
                                    </span>
                                    <span className={styles.compra}>
                                        Compra: {formatearPrecio(productoSeleccionado.precio_compra)}
                                    </span>
                                </div>

                                <div className={styles.stock}>
                                    <span className={stockCritico ? styles.stockBajo : ""}>
                                        <Layers size={14} />
                                        {productoSeleccionado.stock_actual} {productoSeleccionado.unidad_medida}
                                    </span>
                                    <span>
                                        Mín: {productoSeleccionado.stock_minimo}
                                    </span>
                                </div>

                                {/* STOCK POR ALMACÉN */}
                                <div className={styles.almacenes}>
                                    <h5>Stock por almacén</h5>

                                    {productoSeleccionado.detalle_por_almacen.map(a => (
                                        <div key={a.id_inventario} className={styles.almacen}>
                                            <div className={styles.almacenInfo}>
                                                {iconoAlmacen(a.nombre_almacen)}
                                                <span>{a.nombre_almacen}</span>
                                            </div>
                                            <strong>{a.stock}</strong>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.meta}>
                                    <p>
                                        <span>Marca:</span> {productoSeleccionado.marca?.nombre}
                                    </p>
                                    <p>
                                        <span>Categoría:</span> {productoSeleccionado.marca?.categoria?.nombre}
                                    </p>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
