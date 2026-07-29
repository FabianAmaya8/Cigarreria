import { NavLink } from "react-router-dom";
import stylesInicio from "../../../assets/Css/Principales/Inicio.module.scss";

export function TareaItem({ icon, nombre, descripcion, ruta }) {
    return (
        <article className={stylesInicio.tareaCard}>
            <NavLink to={ruta} className={stylesInicio.tareaLink}>
                <span className={stylesInicio.tareaIconWrapper}>
                    <i className={icon}></i>
                </span>
                <h3 className={stylesInicio.tareaTitle}>{nombre}</h3>
            </NavLink>
            <p className={stylesInicio.tareaDescription}>{descripcion}</p>
        </article>
    );
}

export function TareaContainer({ titulo, items }) {
    return (
        <section className={stylesInicio.tareasSection}>
            {titulo && <h2 className={stylesInicio.sectionTitle}>{titulo}</h2>}
            <div className={stylesInicio.tareasGrid}>
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
        </section>
    );
}