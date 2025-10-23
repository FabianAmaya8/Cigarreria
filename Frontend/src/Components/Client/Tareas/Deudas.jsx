import styles from "../../../assets/Css/index.module.scss";
import stylesDeuda from "../../../assets/Css/deuda.module.scss";
import { HandCoins, Coins  } from 'lucide-react';
import { useAuthContext } from "../../../Pages/Context/AuthContext";
import { NavLink } from "react-router-dom";
import useDeudasUsuario from "../../../Hooks/Vendedor/Deudas/useDeudasUsuario";
import { Loading, Error  } from "../../../Utils/Cargando";

export default function Deudas() {
    const { user } = useAuthContext();
    const { data: deudaPersonal, isLoading: loading , error } = useDeudasUsuario(user?.id);

    const opciones = [
        { id: 1, texto: "Lista de deudas", ruta: "/ListaDeudas" },
        { id: 2, texto: "Crear deuda", ruta: "/CrearDeuda" },
        { id: 3, texto: "Editar deuda", ruta: "/EditarDeuda" },
    ]

    return (
        <main className={`${styles.Container} ${stylesDeuda.Container}`} >
            
            <h2>Historial de deudas</h2>
            {user?.rol === 1 || user?.rol === 2 ?
            (
                <div className={stylesDeuda.Item}>
                    {opciones.map((opcion) => (
                        <div key={opcion.id} className={stylesDeuda.Opciones}>
                            <NavLink to={opcion.ruta}>
                                <i className="bx bx-list-ul"></i>
                                {opcion.texto}
                            </NavLink>
                        </div>
                    ))}
                </div>
            )
            : (<div className={`align-items-center flex-column p-5 ${stylesDeuda.Relleno} ${stylesDeuda.Deuda}`}>
                <Coins size={150} strokeWidth={1.3} color="var(--azul-500)" />
                <HandCoins size={150} strokeWidth={1.3} color="var(--azul-500)" />
            </div>)}
            <div className={stylesDeuda.Item}>
                {loading ? (
                    <Loading />
                ) : error ? (
                    <Error msg={error.message} errorCode={error.status} />
                ) : Array.isArray(deudaPersonal) ? (
                    <div className={stylesDeuda.Deudas}>
                        {deudaPersonal.map((deuda) => (
                        <div className={stylesDeuda.Deuda} key={deuda.id_deuda}>
                            <div className={stylesDeuda.Detalles}>
                                <p><b>Usuario:</b> {deuda.usuario_nombre} ({deuda.usuario_usuario})</p>
                                <p><b>Total:</b> {deuda.total}$</p>
                                <p><b>Estado:</b> {deuda.estado}</p>
                                <p><b>Observaciones:</b> {deuda.observaciones}</p>
                                <p><b>Fecha:</b> {new Date(deuda.fecha).toLocaleDateString()}</p>
                            </div>
                            <NavLink 
                                to={`/DetallesDeuda/${deuda.id_deuda}`} 
                                className={stylesDeuda.Boton}
                            >
                                <i className='bx bxs-info-circle'></i>
                                Detalles
                            </NavLink>
                        </div>
                        ))}
                    </div>
                ) : deudaPersonal?.detail ? (
                    <p>{deudaPersonal.detail}</p>
                ) : (
                    <p>No se encontraron resultados.</p>
                )}

            </div>
        </main>
    )
}
