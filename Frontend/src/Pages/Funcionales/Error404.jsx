import { useNavigate } from "react-router-dom";
import { Skull } from "lucide-react";
import styles from "../../assets/Css/Error404.module.scss";

export default function Error404() {
    const navigate = useNavigate();

    return (
        <div className={styles.Error404}>
            <Skull size={100} color="var(--rojo-500)" />

            <h2 className={styles["Error404-title"]}>404</h2>
            <p className={styles["Error404-text"]}>
                ¡Ups! Parece que esta página se fue de paseo.
            </p>

            <button
                className={styles["Error404-button"]}
                onClick={() => navigate(-1)}
            >
                Volver atrás
            </button>
        </div>
    );
}
