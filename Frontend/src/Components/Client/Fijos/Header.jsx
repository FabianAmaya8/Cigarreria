import { NavLink } from "react-router-dom";
import styles from "../../../assets/Css/index.module.scss";
import { useAuthContext } from "../../../Pages/Context/AuthContext";
import { useState } from "react";
import navConfig from "../../../Utils/RutasNav.json";

function Header() {
    const { isAuthenticated, user } = useAuthContext();
    const [menuOpen, setMenuOpen] = useState(false);

    // Filtrar según rol y autenticación
    const navBar = navConfig.filter(item => {
        const roleOk =
            item.roles === "all" || (Array.isArray(item.roles) && item.roles.includes(user?.rol));

        const authOk =
            item.auth === "any" ||
            (item.auth === true && isAuthenticated) ||
            (item.auth === false && !isAuthenticated);

        return roleOk && authOk;
    });

    return (
        <header className={styles.Header}>
            <div className={styles["Header-container"]}>
                {/* Logo SOLO en escritorio */}
                <NavLink to="/" className={`${styles["Header-logo"]} ${styles["only-desktop"]}`}>
                    <img src="./src/assets/logo.png" alt="Logo" />
                </NavLink>

                {/* Título siempre visible */}
                <h1 className={styles["Header-title"]}>Cigarrería JJ</h1>

                {/* Nav SOLO en escritorio */}
                <nav className={`${styles["Header-nav"]} ${styles["only-desktop"]}`}>
                    <ul className={styles["Header-list"]}>
                        {navBar.map((item, index) => (
                            <li key={index} className={styles["Header-item"]}>
                                <NavLink to={item.ruta} className={styles["Header-link"]}>
                                    <i className={item.icon}></i>
                                    {item.texto}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Botón Hamburguesa SOLO en móvil */}
                <button
                    className={`${styles["Header-burger"]} ${styles["only-mobile"]}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <i className={menuOpen ? "bx bx-x" : "bx bx-menu"}></i>
                </button>
            </div>

            {/* Menú lateral con logo + opciones */}
            <nav
                className={`${styles["Header-overlay"]} ${
                    menuOpen ? styles["is-open"] : ""
                }`}
            >
                <div className={styles["Overlay-content"]}>
                    <NavLink to="/" className={styles["Overlay-logo"]}>
                        <img src="./src/assets/logo.png" alt="Logo" />
                    </NavLink>
                    <ul className={styles["Header-list"]}>
                        {navBar.map((item, index) => (
                            <li key={index} className={styles["Header-item"]}>
                                <NavLink
                                    to={item.ruta}
                                    className={styles["Header-link"]}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <i className={item.icon}></i>
                                    {item.texto}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </header>
    );
}

export default Header;
