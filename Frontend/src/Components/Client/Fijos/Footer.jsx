import { useAuthContext } from "../../../Pages/Context/AuthContext";
import { Hourglass } from 'ldrs/react'
import { CalendarClock } from 'lucide-react';
import useContador from "../../../Hooks/Client/Contador";
import styles from "../../../assets/Css/index.module.scss";

function Footer() {
    const { isAuthenticated , user } = useAuthContext();
    const contador = useContador(user?.exp);
    
    return (
        <footer className={styles.Footer}>
            <div className={styles["Footer-container"]}>
                <p>Cigarrería JJ ©</p>

                {isAuthenticated ? (
                    <div className={styles.FooterContador}>
                        <div className={styles.FooterTiempo}>
                            <Hourglass size={32} speed={4} color="var(--rojo-400)" />
                            <span>
                                Tiempo restante <br />
                                {contador.dias}d {contador.horas}h {contador.minutos}m
                            </span>
                            <Hourglass size={32} speed={4} color="var(--rojo-400)" />
                        </div>
                        <div className={styles.FooterTiempo}>
                            <CalendarClock size={32} color="var(--rojo-400)" />
                            <span>
                                Cierre de sesión <br />
                                {contador.fechaObjetivo?.toLocaleTimeString()}
                            </span>
                            <CalendarClock size={32} color="var(--rojo-400)" />
                        </div>
                    </div>
                ): null}

                <p>Desarrollado por: Fabian Amaya</p>
            </div>
        </footer>
    );
}

export default Footer;
