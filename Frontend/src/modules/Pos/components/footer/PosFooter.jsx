import styles from "../../../../assets/Css/Pos/posFooter.module.scss";

export default function PosFooter({
    total,
    cantidadItems ,
    productos ,
    recargas ,
    chance ,
}) {
    return (
        <footer className={styles.footer}>
            <div className={styles.left}>
                <span>Items: {cantidadItems}</span>
                <span>Productos: {productos}</span>
                <span>Recargas: {recargas}</span>
                <span>Chance: {chance}</span>
            </div>

            <div className={styles.total}>
                Total: <strong>{total}</strong>
            </div>
        </footer>
    );
}
