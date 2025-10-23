import styles from "../../../assets/Css/index.module.scss";
import stylesDeuda from "../../../assets/Css/deuda.module.scss";
import { Hourglass } from "ldrs/react";
import useDetallesDeudas from "../../../Hooks/Vendedor/Deudas/useDetallesDeudas";
import { Loading, Error } from "../../../Utils/Cargando";

export default function DetallesDeuda() {
    const { id } = useParams();
    const { data: deuda, isLoading, error } = useDetallesDeudas(id);

    const msgError = error?.response?.status === 403
                        ? "No autorizado para ver esta deuda"
                        : "Ocurrió un error al cargar los detalles"

    return (
        <main className={`${styles.Container} ${stylesDeuda.Container}`}>

            <h2>Detalles de deuda</h2>

            {/* Cargando */}
            {isLoading && (
                <Loading />
            )}

            {/* Error */}
            {error && (
                <Error msg={msgError} errorCode={error} />
            )}

            {/* Información de deuda */}
            {deuda && (
                <>
                    <div className={stylesDeuda.Cabecera}>
                        <p>
                            <b>ID Deuda:</b> {deuda.id_deuda}
                        </p>
                        <p>
                            <b>Cliente:</b> {deuda.usuario_nombre} ({deuda.usuario_usuario})
                        </p>
                        <p>
                            <b>Fecha:</b>{" "}
                            {new Date(deuda.fecha).toLocaleString("es-CO")}
                        </p>
                        <p>
                            <b>Estado:</b> {deuda.estado}
                        </p>
                        {deuda.observaciones && (
                            <p>
                                <b>Obs:</b> {deuda.observaciones}
                            </p>
                        )}
                        <p>
                            <b>Total:</b> ${deuda.total.toLocaleString()}
                        </p>
                    </div>

                    {/* Detalles de productos */}
                    <div className={stylesDeuda.Deudas}>
                        {deuda.detalles.map((detalle) => (
                            <div key={detalle.id_detalle_deuda} className={stylesDeuda.Deuda}>
                                <div className={stylesDeuda.Detalles}>
                                    <p>
                                        <b>{detalle.producto.nombre}</b>
                                    </p>
                                    <p>{detalle.producto.descripcion}</p>
                                    <p>
                                        Cantidad: <b>{detalle.cantidad}</b>
                                    </p>
                                    <p>
                                        Precio unitario: ${detalle.precio_unitario.toLocaleString()}
                                    </p>
                                    <p>
                                        Subtotal: <b>${detalle.subtotal.toLocaleString()}</b>
                                    </p>
                                </div>
                                <div className={stylesDeuda.Imagen}>
                                    {detalle.producto.imagen ? (
                                        <img
                                            src={detalle.producto.imagen}
                                            alt={detalle.producto.nombre}
                                        />
                                    ) : (
                                        <i className="bx bx-image"></i>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}