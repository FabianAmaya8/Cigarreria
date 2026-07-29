import stylesInicio from "../../../assets/Css/Principales/Inicio.module.scss";
import RutasInventario from "../../../Utils/GestionInventario.json";
import { TareaContainer } from "../../Client/Tareas/ComponentsTareas";

export default function GestionInventario() {
    return (
        <main className={`${stylesInicio.inicioMain}`}>
            <h1 className={stylesInicio.pageTitle}>Gestión de Inventario</h1>
            <section className={stylesInicio.inventarioContent}>
                {RutasInventario.map((ruta, index) => (
                    <TareaContainer
                        key={index}
                        titulo={ruta.Titulo}
                        items={ruta.items}
                    />
                ))}
            </section>
        </main>
    );
}
