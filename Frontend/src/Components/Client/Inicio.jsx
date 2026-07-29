import { useAuthContext } from "../../Pages/Context/AuthContext";
import { RectangleEllipsis, KeySquare } from "lucide-react";
import { NavLink } from "react-router-dom";
import navConfig from "../../Utils/RutasNav.json";
import stylesInicio from "../../assets/Css/Principales/Inicio.module.scss";
import { TareaContainer } from "../Client/Tareas/ComponentsTareas";

export default function Inicio() {
    const { isAuthenticated, user } = useAuthContext();

    const navBar = navConfig.filter(item => {
        const roleOk =
            item.roles === "all" ||
            (Array.isArray(item.roles) && item.roles.includes(user?.rol));

        const authOk =
            item.auth === "any" ||
            (item.auth === true && isAuthenticated) ||
            (item.auth === false && !isAuthenticated);

        return roleOk && authOk && item.tarea === true;
    });

    return (
        <main className={`${stylesInicio.inicioMain}`}>
            {isAuthenticated ? (
                <section className={stylesInicio.authenticatedSection}>
                    <h1 className={stylesInicio.pageTitle}>¿Qué deseas hacer?</h1>
                    <TareaContainer items={navBar} />
                </section>
            ) : (
                <InformacionSinLogin />
            )}
        </main>
    );
}

export function InformacionSinLogin() {
    return (
        <div className={stylesInicio.ItemContainer}>
            <div className={stylesInicio.GrupoIconos}>
                <RectangleEllipsis size={120} color="var(--azul-200)" />
                <KeySquare size={120} color="var(--azul-200)" />
            </div>
            <h2>¡Bienvenido a Cigarrería JJ!</h2>
            <p>Por favor, inicie sesión para acceder a las demás funciones.</p>
            <div className={`${stylesInicio.GrupoBotones} btn-group btn-group-lg`}>
                <NavLink className="btn btn-outline-primary" to="/login">
                    <i className="bx bx-user"></i>
                    Login
                </NavLink>
                <NavLink className="btn btn-outline-primary" to="/register">
                    <i className="bx bx-user-plus"></i>
                    Register
                </NavLink>
            </div>
        </div>
    );
}