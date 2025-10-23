import styles from "../../../assets/Css/index.module.scss";
import stylesDeuda from "../../../assets/Css/deuda.module.scss";
import { Hourglass } from "ldrs/react";
import { useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import useListaDeudas from "../../../Hooks/Vendedor/Deudas/useListaDeudas";

export default function ListaDeudas() {
    const navigate = useNavigate();
    const { data: listaDeudas, isLoading, error } = useListaDeudas();

    // Estado para filtros
    const [filtroBusqueda, setFiltroBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [ordenFecha, setOrdenFecha] = useState("desc");

    // Filtros de los datos
    const deudasFiltradas = listaDeudas
        ?.filter((deuda) => {
            return (
                (filtroBusqueda === "" ||
                    deuda.usuario_nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
                    deuda.usuario_usuario.toLowerCase().includes(filtroBusqueda.toLowerCase())) &&
                (filtroEstado === "" || deuda.estado === filtroEstado)
            );
        })
        .sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            return ordenFecha === "asc" ? fechaA - fechaB : fechaB - fechaA;
        });

    return (
        <main className={`${styles.Container} ${stylesDeuda.Container}`}>

            <h2>Lista de deudas</h2>

            {/* Filtros */}
            <div className={`${stylesDeuda.Item} ${stylesDeuda.Filtros}`}>
                <label>
                    Buscar
                    <input
                        type="text"
                        placeholder="Buscar por nombre o usuario..."
                        value={filtroBusqueda}
                        onChange={(e) => setFiltroBusqueda(e.target.value)}
                    />
                </label>

                <label>
                    Estado
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="parcial">Parcial</option>
                        <option value="pagada">Pagada</option>
                    </select>
                </label>

                <label>
                    Ordenar por fecha
                    <select
                        value={ordenFecha}
                        onChange={(e) => setOrdenFecha(e.target.value)}
                    >
                        <option value="desc">Más recientes</option>
                        <option value="asc">Más antiguas</option>
                    </select>
                </label>
            </div>

            {/* Lista de deudas */}
            <div className={stylesDeuda.Item}>
                {isLoading ? (
                    <div className="cargando">
                        <Hourglass size={80} speed={1} color="var(--azul-500)" />
                    </div>
                ) : (
                    <div className={stylesDeuda.Deudas}>
                        {deudasFiltradas?.map((deuda) => (
                            <div className={stylesDeuda.Deuda} key={deuda.id_deuda}>
                                <div className={stylesDeuda.Detalles}>
                                    <p>
                                        <b>Usuario:</b> {deuda.usuario_nombre} (
                                        {deuda.usuario_usuario})
                                    </p>
                                    <p>
                                        <b>Total:</b> {deuda.total}$
                                    </p>
                                    <p>
                                        <b>Estado:</b> {deuda.estado}
                                    </p>
                                    <p>
                                        <b>Observaciones:</b> {deuda.observaciones}
                                    </p>
                                    <p>
                                        <b>Fecha:</b>{" "}
                                        {new Date(deuda.fecha).toLocaleDateString()}
                                    </p>
                                </div>
                                <NavLink
                                    to={`/DetallesDeuda/${deuda.id_deuda}`}
                                    className={stylesDeuda.Boton}
                                >
                                    <i className="bx bxs-info-circle"></i>
                                    Detalles
                                </NavLink>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
