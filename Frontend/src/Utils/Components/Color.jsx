import { useTheme } from "../../Pages/Context/ColorContexts";
import { Sun, Moon } from "lucide-react";
import styles from "../../assets/Css/Dependencias/Color.module.scss";

export default function Color() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className={styles.themeButton}
            aria-label="Cambiar tema"
        >
            {theme === "claro" ? (
                <Sun size={40} />
            ) : (
                <Moon size={40} />
            )}
        </button>
    );
}