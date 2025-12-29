import {
    CreditCard,
    Receipt,
    Smartphone,
    Dice5,
    Search,
} from "lucide-react";
import styles from "../../../../assets/Css/Pos/mesas.module.scss";
import { POS_CONFIG } from "../../config/pos.config";

function Hotkey({ value }) {
    if (!value) return null;
    return <kbd className={styles.hotkey}>{value}</kbd>;
}

export default function AccionesMesa({
    onCerrarVenta,
    onCerrarDeuda,
    onRecarga,
    onChance,
    onConsultarProducto,
}) {
    const { HOTKEYS } = POS_CONFIG;
    

    return (
        <div className={styles.acciones}>
            <hr />

            <button className={styles.venta} onClick={onCerrarVenta}>
                <CreditCard size={18} />
                <span>Cerrar venta</span>
                <Hotkey value={HOTKEYS.CERRAR_VENTA.key} />
            </button>

            <button className={styles.deuda} onClick={onCerrarDeuda}>
                <Receipt size={18} />
                <span>Cerrar deuda</span>
                <Hotkey value={HOTKEYS.CERRAR_DEUDA.key} />
            </button>

            <hr />

            <button onClick={onRecarga}>
                <Smartphone size={18} />
                <span>Agregar recarga</span>
                <Hotkey value={HOTKEYS.AGREGAR_RECARGA.key} />
            </button>

            <button onClick={onChance}>
                <Dice5 size={18} />
                <span>Agregar chance</span>
                <Hotkey value={HOTKEYS.AGREGAR_CHANCE.key} />
            </button>

            <hr />

            <button onClick={onConsultarProducto}>
                <Search size={18} />
                <span>Consultar producto</span>
                <Hotkey value={HOTKEYS.CONSULTAR_PRODUCTO.key} />
            </button>
        </div>
    );
}
