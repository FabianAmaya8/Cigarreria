import ProductoRow from "./ProductoRow";
import DistintoRow from "./DistintoRow";
import styles from "../../../../assets/Css/Pos/productoRow.module.scss";

export default function TicketProductos({
    productos = [],
    recargas = [],
    chance = [],
    onEditarProducto,
    onEditarDistinto,
    formatearPrecio,
}) {
    if (!productos.length && !recargas.length && !chance.length) {
        return (
            <div className={styles.empty}>
                No hay nada en la mesa
            </div>
        );
    }

    // 🔹 Unificamos recargas y chance
    const distintos = [
        ...recargas.map((r) => ({
            ...r,
            tipo: "recarga",
            id: r.id_recarga,
        })),
        ...chance.map((c) => ({
            ...c,
            tipo: "chance",
            id: c.id_chance,
        })),
    ];

    return (
        <div className={styles.lista}>
            {/* PRODUCTOS */}
            {!productos.length ? null :
                (<div className={styles.row + " " + styles.titulo}>
                    <span>Producto</span>
                    <span>Cantidad</span>
                    <span>Precio</span>
                    <span>Sub Total</span>
                    <span>Borrar</span>
                </div>)
            }

            {productos.map((p) => (
                <ProductoRow
                    key={p.id_producto + " " + p.id_almacen}
                    producto={p}
                    onIncrement={() =>
                        onEditarProducto(p.id_producto, p.cantidad + 1)
                    }
                    onDecrement={() =>
                        onEditarProducto(p.id_producto, p.cantidad - 1)
                    }
                    onChangeCantidad={(cantidad) =>
                        onEditarProducto(p.id_producto, cantidad)
                    }
                    onRemove={() =>
                        onEditarProducto(p.id_producto, 0)
                    }
                    formatearPrecio={formatearPrecio}
                />
            ))}

            {!recargas.length && !chance.length ? null :
                (<div className={styles.row + " " + styles.titulo}>
                    <span>Recarga / Chance</span>
                    <span>Cantidad</span>
                    <span className={styles.subtotalGrande}>Sub Total</span>
                    <span>Borrar</span>
                </div>)
            }

            {/* RECARGAS + CHANCE */}
            {distintos.map((d) => (
                <DistintoRow
                    key={`${d.tipo}-${d.id}`}
                    distinto={d}
                    tipo={d.tipo}
                    onConfirmCantidad={(valor) =>
                        onEditarDistinto(d.tipo, valor, d.id)
                    }
                    onRemove={() =>
                        onEditarDistinto(d.tipo, 0, d.id)
                    }
                    formatearPrecio={formatearPrecio}
                />
            ))}
        </div>
    );
}
