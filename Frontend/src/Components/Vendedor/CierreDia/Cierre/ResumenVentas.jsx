import { useState } from "react";
import { FaRegFolderOpen, FaRegImage, FaTag, FaTableColumns, FaRegChartBar } from "react-icons/fa6";
import styles from "../../../../assets/Css/CierraDia/CierreDia.module.scss";

const moneyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

function formatMoney(value) {
    return moneyFormatter.format(Number(value || 0));
}

export default function ResumenVentas({ ventas: data }) {
    const [vista, setVista] = useState(1);

    const {
        ventas_por_producto = [],
        ventas_por_marca = [],
        ventas_por_categoria = [],
    } = data;

    const totalProductos = ventas_por_producto.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const totalMarcas = ventas_por_marca.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const totalCategorias = ventas_por_categoria.reduce((acc, v) => acc + Number(v.total || 0), 0);

    const tituloVista = vista === 1 ? "Producto" : vista === 2 ? "Marca" : "Categoria";

    const items = vista === 1 ? ventas_por_producto : vista === 2 ? ventas_por_marca : ventas_por_categoria;
    const totalActual = vista === 1 ? totalProductos : vista === 2 ? totalMarcas : totalCategorias;

    return (
        <section className={styles.containerCart}>
            <header className={styles.sectionHeader}>
                <div>
                    <span className={styles.sectionKicker}>Analisis del cierre</span>
                    <h3>Ventas por {tituloVista}</h3>
                </div>
                <span className={styles.total}>{formatMoney(totalActual)}</span>
            </header>

            <div className={styles.buttons}>
                <button type="button" className={vista === 1 ? styles.active : ""} onClick={() => setVista(1)}>
                    <FaRegImage />
                    Producto
                </button>
                <button type="button" className={vista === 2 ? styles.active : ""} onClick={() => setVista(2)}>
                    <FaTag />
                    Marca
                </button>
                <button type="button" className={vista === 3 ? styles.active : ""} onClick={() => setVista(3)}>
                    <FaTableColumns />
                    Categoria
                </button>
            </div>

            {items.length === 0 ? (
                <div className={styles.emptyState}>
                    <FaRegFolderOpen />
                    <p>No hay ventas para este rango.</p>
                </div>
            ) : (
                <div className={styles.gridVentas}>
                    {items.map((item, index) => {
                        if (vista === 1) {
                            return (
                                <article key={`${item.producto}-${index}`} className={styles.ventaCard}>
                                    <div className={styles.ventaImageWrap}>
                                        {item.imagen ? (
                                            <img
                                                src={item.imagen}
                                                alt={item.producto}
                                                className={styles.ventaImagen}
                                            />
                                        ) : (
                                            <FaRegImage />
                                        )}
                                    </div>
                                    <div className={styles.ventaBody}>
                                        <strong>{item.producto}</strong>
                                        <span>{item.marca}</span>
                                        <div className={styles.ventaMeta}>
                                            <span>Cant. {item.cantidad}</span>
                                            <span>{formatMoney(item.total)}</span>
                                        </div>
                                    </div>
                                </article>
                            );
                        }

                        if (vista === 2) {
                            return (
                                <article key={`${item.marca}-${index}`} className={styles.ventaCard}>
                                    <div className={styles.ventaBadge}>
                                        <FaTag />
                                    </div>
                                    <div className={styles.ventaBody}>
                                        <strong>{item.marca}</strong>
                                        <div className={styles.ventaMeta}>
                                            <span>Cant. {item.cantidad}</span>
                                            <span>{formatMoney(item.total)}</span>
                                        </div>
                                    </div>
                                </article>
                            );
                        }

                        return (
                            <article key={`${item.categoria}-${index}`} className={styles.ventaCard}>
                                <div className={styles.ventaBadge}>
                                    <FaTableColumns />
                                </div>
                                <div className={styles.ventaBody}>
                                    <strong>{item.categoria}</strong>
                                    <div className={styles.ventaMeta}>
                                        <span>Cant. {item.cantidad}</span>
                                        <span>{formatMoney(item.total)}</span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
