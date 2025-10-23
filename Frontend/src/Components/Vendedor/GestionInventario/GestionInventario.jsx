import styles from "../../../assets/Css/index.module.scss";
import stylesInicio from "../../../assets/Css/Inicio.module.scss";
import RutasInventario from "../../../Utils/GestionInventario.json";
import { TareaContainer } from "../../Client/Tareas/ComponentsTareas";

export default function GestionInventario() {
    return (
        <main className= {`${styles.Container} ${stylesInicio.ItemContainer}`}>
            <h2>Gestión de Inventario</h2>
            {RutasInventario.map((ruta, index) => (
                <TareaContainer
                    key={index}
                    titulo={ruta.Titulo}
                    items={ruta.items}
                />
            ))}
        </main>
    );
}
