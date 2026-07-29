import { useAuthContext } from "../../../Pages/Context/AuthContext";
import { Hourglass } from 'ldrs/react'
import { CalendarClock } from 'lucide-react';
import useContador from "../../../Hooks/Client/Contador";
import styles from "../../../assets/Css/Principales/index.module.scss";
import Color from "../../../Utils/Components/Color";

function Footer() {
    const { isAuthenticated , user } = useAuthContext();
    const contador = useContador(user?.exp);
    
    return (
        <footer className={styles.footer}>
            <div className={styles["footer-container"]}>
                <p className={styles["footer-brand"]}>Cigarrería JJ ©</p>

                {isAuthenticated ? (
                    <div className={styles["footer-contador"]}>
                        <div className={styles["footer-tiempo"]}>
                            <Hourglass size={32} speed={4} color="var(--rojo-400)" />
                            <span>
                                Tiempo restante <br />
                                {contador.dias}d {contador.horas}h {contador.minutos}m
                            </span>
                            <Hourglass size={32} speed={4} color="var(--rojo-400)" />
                        </div>
                        <div className={styles["footer-tiempo"]}>
                            <CalendarClock size={32} color="var(--rojo-400)" />
                            <span>
                                Cierre de sesión <br />
                                {contador.fechaObjetivo?.toLocaleTimeString()}
                            </span>
                            <CalendarClock size={32} color="var(--rojo-400)" />
                        </div>
                    </div>
                ) : null}

                <Color />
            </div>
        </footer>
    );
}

export default Footer;
