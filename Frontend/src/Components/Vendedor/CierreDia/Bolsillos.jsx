import useCierreDia from "../../../Hooks/Vendedor/CierreDia/useCierreDia";
import useBolsillos from "../../../Hooks/Vendedor/CierreDia/useBolsillos";
import styles from "../../../assets/Css/CierraDia/CierreDia.module.scss";
import HeroCierre from "./Cierre/HeroCierre";
import ResumenGeneral from "./Cierre/ResumenGeneral";
import ProgressResumen from "./Cierre/ProgressResumen";
import ListaBolsillos from "./Bolsillos/ListaBolsillos";
import { Loading, Error } from "../../../Utils/Components/Cargando";
import { detactarEstadoCierre } from "./cierreDia.utils";

export default function Bolsillos() {
    const { isLoading: isLoadingCierre, error: cierreError } = useCierreDia();

    const {
        bolsillos,
        movimientos,
        totalDisponible,
        totalAsignado,
        totalCierre,
        porcentajeAsignado,
        porcentajeDisponible,
        isLoading: isLoadingBolsillos,
        error: bolsillosError,
        crearBolsillo,
        actualizarBolsillo,
        eliminarBolsillo,
        moverBolsillo,
        hacerPago,
        isCreando,
        isActualizando,
        isEliminando,
        isMoviendo,
        isPagando,
    } = useBolsillos();

    const { estado: estadoCierre, title: titleCierre } = detactarEstadoCierre(
        totalCierre,
        totalAsignado,
        totalDisponible
    );

    const isLoading = isLoadingCierre || isLoadingBolsillos;
    const error = cierreError || bolsillosError;

    if (isLoading) return <Loading />;
    if (error) return <Error msg="Error al obtener bolsillos" />;

    return (
        <main className={styles.container}>
            <section className={styles.hero}>
                <HeroCierre
                    kicker="Vista de bolsillos"
                    title="Administra tu dinero como si fueran cajitas"
                    lead="Crea, edita y elimina bolsillos para organizar el dinero del cierre con una experiencia simple, clara y pensada para movil."
                    estadoCierre={estadoCierre}
                    titleCierre={titleCierre}
                />
                <ResumenGeneral
                    totalCierre={totalCierre}
                    totalAsignado={totalAsignado}
                    totalDisponible={totalDisponible}
                    porcentajeAsignado={porcentajeAsignado}
                    porcentajeDisponible={porcentajeDisponible}
                    estadoCierre={estadoCierre}
                />
                <ProgressResumen
                    totalAsignado={totalAsignado}
                    totalDisponible={totalDisponible}
                    porcentajeAsignado={porcentajeAsignado}
                />
            </section>

            <ListaBolsillos
                bolsillos={bolsillos}
                movimientos={movimientos}
                totalDisponible={totalDisponible}
                totalAsignado={totalAsignado}
                totalCierre={totalCierre}
                porcentajeAsignado={porcentajeAsignado}
                porcentajeDisponible={porcentajeDisponible}
                onCreate={crearBolsillo}
                onUpdate={actualizarBolsillo}
                onDelete={eliminarBolsillo}
                onMove={moverBolsillo}
                onPay={hacerPago}
                isCreando={isCreando}
                isActualizando={isActualizando}
                isEliminando={isEliminando}
                isMoviendo={isMoviendo}
                isPagando={isPagando}
            />
        </main>
    );
}
