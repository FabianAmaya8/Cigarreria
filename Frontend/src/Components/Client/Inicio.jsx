import { useAuthContext } from "../../Pages/Context/AuthContext";
import { RectangleEllipsis, KeySquare  } from 'lucide-react';
import { NavLink } from "react-router-dom";
import navConfig from "../../Utils/RutasNav.json";
import styles from "../../assets/Css/index.module.scss";
import stylesInicio from "../../assets/Css/Inicio.module.scss";

export default function Inicio() {
    const { isAuthenticated , user } = useAuthContext();

    const navBar = navConfig.filter(item => {
            const roleOk =
                item.roles === "all" || (Array.isArray(item.roles) && item.roles.includes(user?.rol));
    
            const authOk =
                item.auth === "any" ||
                (item.auth === true && isAuthenticated) ||
                (item.auth === false && !isAuthenticated);

            const tareaOk =
                item.tarea === "any" ||
                (item.tarea === true && isAuthenticated) ||
                (item.tarea === false && !isAuthenticated);
    
            return roleOk && authOk && tareaOk;
        });

    return (
        <main className={styles.Container}>
        {isAuthenticated ? (
            <div className={stylesInicio.ItemContainer}>
                <h2>Que deseas hacer</h2>
                <div className={stylesInicio.TareaContainer}>
                    {navBar.map((item, index) => (
                        <div key={index} className={stylesInicio.Tarea}>
                            <NavLink to={item.ruta}>
                                <i className={item.icon}></i>
                                {item.texto}
                            </NavLink>
                            <p>{item.descripcion}</p>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <InformacionSinLogin />
        )}
        </main>
    );
}

// <------------------------------------->
//        Informacion sin login
// <------------------------------------->

const InformacionSinLogin = () => {
    return (
        <div className={stylesInicio.ItemContainer}>
                <div className={stylesInicio.GrupoIconos}>
                    <RectangleEllipsis size={120} color="var(--azul-200)" />
                    <KeySquare size={120} color="var(--azul-200)" />
                </div>
                <h2>¡Bienvenido a Cigarrería JJ!</h2>
                <p>Por favor, inicie sesión para acceder a las demas funciones.</p>
                <div className={stylesInicio.GrupoBotones + " btn-group btn-group-lg"}>
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
    )
}