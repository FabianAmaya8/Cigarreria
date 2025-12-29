import styles from "../../../../assets/Css/Pos/mesas.module.scss";

export default function MesaButton({ id, activa, onClick, label }) {
    return (
        <button
            className={activa ? styles.activa : styles.mesa}
            onClick={onClick}
        >
            {label || `Mesa ${id}`}
        </button>
    );
}
