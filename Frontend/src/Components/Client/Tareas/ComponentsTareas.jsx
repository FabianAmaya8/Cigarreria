import { NavLink } from "react-router-dom";
import stylesInicio from "../../../assets/Css/Inicio.module.scss";

export function TareaItem({ icon, nombre, descripcion, ruta }) {
    return (
        <div className={stylesInicio.Tarea}>
            <NavLink to={ruta}>
                <i className={icon}></i>
                {nombre}
            </NavLink>
            <p>{descripcion}</p>
        </div>
    );
}

export function TareaContainer({ titulo, items }) {
    return (
        <div className={stylesInicio.TareaContainer}>
            {titulo && <h3>{titulo}</h3>}
            {items.map((item, index) => (
                <TareaItem
                    key={index}
                    icon={item.icono || item.icon}
                    nombre={item.nombre || item.texto}
                    descripcion={item.descripcion}
                    ruta={item.ruta}
                />
            ))}
        </div>
    );
}
