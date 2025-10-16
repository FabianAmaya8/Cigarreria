import navConfig from "../../../Utils/RutasNav.json";
import styles from "../../../assets/Css/index.module.scss";
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
        <header className={styles.Header}>
            <div className={styles["Header-container"]}>
                {/* Logo SOLO en escritorio */}
                <NavLink to="/" className={`${styles["Header-logo"]} ${styles["only-desktop"]}`}>
                    <img src={logo} alt="Logo" />
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
                    {isAuthenticated ?
                    (<NavLink to="/Personal" className={`${styles["HeaderUser"]} ${styles["only-desktop"]}`}>
                        {loading ? (<Hourglass size={80} color="var(--texto)" />) : 
                        imagen ? (
                            <img src={imagen} alt="Imagen de Perfil" />
                        ) : (
                            <i className="bx bx-user "></i>
                        )
                        }
                    </NavLink>
                    ): null}
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
                        <img src= {logo} alt="Logo" />
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
                    {isAuthenticated ? (
                        <NavLink 
                            to="/Personal" 
                            className={`${styles["HeaderUser"]} ${styles["Overlay-logo"]}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {loading ? (<Hourglass size={80} color="var(--texto)" />) : 
                            imagen ? (
                                <img src={imagen} alt="Imagen de Perfil" />
                            ) : (
                                <i className="bx bx-user "></i>
                            )
                            }
                        </NavLink>
                    ): null}
                </div>
            </nav>
        </header>
    );
}

export default Header;
