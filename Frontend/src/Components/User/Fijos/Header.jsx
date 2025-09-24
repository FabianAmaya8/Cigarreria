import { NavLink } from "react-router-dom";
import styles from "../../../assets/Css/index.module.scss";

function Header() {
    return (
        <header className={styles.Header}>
            <div className={styles["Header-container"]}>
                <NavLink to="/" className={styles["Header-logo"]}>
                    <img src="./src/assets/logo.png" alt="Logo" />
                </NavLink>
                <h2 className={styles["Header-title"]}>Cigarrería JJ</h2>
                <nav className={styles["Header-nav"]}>
                    <ul className={styles["Header-list"]}>
                        <li><NavLink to="/">Home</NavLink></li>
                        <li><NavLink to="/Productos">Productos</NavLink></li>
                        <li><NavLink to="/Contacto">Contacto</NavLink></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
