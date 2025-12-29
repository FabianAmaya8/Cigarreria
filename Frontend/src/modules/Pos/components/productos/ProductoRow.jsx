import styles from "../../../../assets/Css/Pos/productoRow.module.scss";
import { Trash2, CircleMinus, CirclePlus, Warehouse, ShoppingBasket } from 'lucide-react';


export default function ProductoRow({
    producto,
    onIncrement,
    onDecrement,
    onChangeCantidad,
    onRemove,
    formatearPrecio,
}) {
    return (
        <div className={styles.row}>
            <div className={styles.nombre}>
                {producto.id_almacen === 1 ? <Warehouse color="var(--azul-500)"/> : <ShoppingBasket color="var(--azul-500)"/>} {producto.nombre} 
            </div>

            <div className={styles.controles}>
                <button onClick={onDecrement}>
                    <CircleMinus />
                </button>

                <input
                    type="number"
                    value={producto.cantidad}
                    min={1}
                    onChange={(e) =>
                        onChangeCantidad(Number(e.target.value))
                    }
                />

                <button onClick={onIncrement}>
                    <CirclePlus />
                </button>
            </div>

            <div className={styles.subtotal}>
                {formatearPrecio(producto.precio_unitario)}
            </div>
            
            <div className={styles.subtotal}>
                {formatearPrecio(producto.subtotal)}
            </div>

            <button className={styles.remove} onClick={onRemove}>
                <Trash2 />
            </button>
        </div>
    );
}
