import navConfig from "../../../Utils/RutasNav.json";
import styles from "../../../assets/Css/Principales/index.module.scss";
import { Hourglass } from 'ldrs/react'
import { useAuthContext } from "../../../Pages/Context/AuthContext";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import useImagen from "../../../Hooks/Client/useImagen";
import logo from "../../../assets/logo.png";

function Header() {
    const { isAuthenticated, user } = useAuthContext();
    const [menuOpen, setMenuOpen] = useState(false);
    const { data: imagen, isLoading: loading , error } = useImagen(user?.id);

    // Filtrar según rol y autenticación
    const navBar = navConfig.filter(item => {
        const roleOk =
            item.roles === "all" || (Array.isArray(item.roles) && item.roles.includes(user?.rol));

        const authOk =
            item.auth === "any" ||
            (item.auth === true && isAuthenticated) ||
            (item.auth === false && !isAuthenticated);

        const navBarOk = item.navBar === true;

        return roleOk && authOk && navBarOk;
    });

    return (
        <header className={styles.header}>
            <div className={styles["header-container"]}>
                {/* Logo SOLO en escritorio */}
                <NavLink to="/" className={`${styles["header-logo"]} ${styles["only-desktop"]}`}>
                    <img src={logo} alt="Logo" />
                </NavLink>

                {/* Título siempre visible */}
                <h1 className={styles["header-title"]}>Cigarrería JJ</h1>

                {/* Nav SOLO en escritorio */}
                <nav className={`${styles["header-nav"]} ${styles["only-desktop"]}`}>
                    <ul className={styles["header-list"]}>
                        {navBar.map((item, index) => (
                            <li key={index} className={styles["header-item"]}>
                                <NavLink to={item.ruta} className={styles["header-link"]}>
                                    <i className={item.icon}></i>
                                    <span>{item.texto}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {isAuthenticated ? (
                        <NavLink to="/Personal" className={`${styles["header-user"]} ${styles["only-desktop"]}`}>
                            {loading ? (
                                <Hourglass size={80} color="var(--texto)" />
                            ) : imagen ? (
                                <img src={imagen} alt="Imagen de Perfil" />
                            ) : (
                                <i className="bx bx-user"></i>
                            )}
                        </NavLink>
                    ) : null}
                </nav>

                {/* Botón Hamburguesa SOLO en móvil */}
                <button
                    className={`${styles["header-burger"]} ${styles["only-mobile"]}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <i className={menuOpen ? "bx bx-x" : "bx bx-menu"}></i>
                </button>
            </div>

            {/* Menú lateral con logo + opciones */}
            <nav className={`${styles["header-overlay"]} ${menuOpen ? styles["is-open"] : ""}`}>
                <div className={styles["overlay-content"]}>
                    <NavLink to="/" className={styles["overlay-logo"]}>
                        <img src={logo} alt="Logo" />
                    </NavLink>

                    <ul className={styles["header-list"]}>
                        {navBar.map((item, index) => (
                            <li key={index} className={styles["header-item"]}>
                                <NavLink
                                    to={item.ruta}
                                    className={styles["header-link"]}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <i className={item.icon}></i>
                                    <span>{item.texto}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {isAuthenticated ? (
                        <NavLink
                            to="/Personal"
                            className={`${styles["header-user"]} ${styles["overlay-logo"]}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {loading ? (
                                <Hourglass size={80} color="var(--texto)" />
                            ) : imagen ? (
                                <img src={imagen} alt="Imagen de Perfil" />
                            ) : (
                                <i className="bx bx-user"></i>
                            )}
                        </NavLink>
                    ) : null}
                </div>
            </nav>
        </header>
    );
}

export default Header;
