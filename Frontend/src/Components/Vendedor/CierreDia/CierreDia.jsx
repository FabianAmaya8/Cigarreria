import useCierreDia from "../../../Hooks/Vendedor/CierreDia/useCierreDia";
import useBolsillos from "../../../Hooks/Vendedor/CierreDia/useBolsillos";
import styles from "../../../assets/Css/CierraDia/CierreDia.module.scss";
import HeroCierre from "./Cierre/HeroCierre";
import ResumenGeneral from "./Cierre/ResumenGeneral";
import ProgressResumen from "./Cierre/ProgressResumen";
import RangoFechas from "./Cierre/RangoFechas";
import ResumenCajas from "./Cierre/ResumenCajas";
import ResumenVentas from "./Cierre/ResumenVentas";
import ListaBolsillos from "./Bolsillos/ListaBolsillos";
import { Loading, Error } from "../../../Utils/Components/Cargando";
import { detactarEstadoCierre } from "./cierreDia.utils";

export default function CierreDia() {
    const {
        desde,
        hasta,
        setDesde,
        setHasta,
        cierreDia,
        isLoading: isLoadingCierre,
        error: cierreError,
        guardarCierreDia,
        isGuardando,
    } = useCierreDia();

    const {
        bolsillos,
        totalDisponible,
        totalAsignado,
        totalCierre,
        porcentajeAsignado,
        porcentajeDisponible,
        movimientos,
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
    if (error) return <Error msg="Error al obtener cierre" />;

    return (
        <main className={styles.container}>
            <RangoFechas desde={desde} hasta={hasta} setDesde={setDesde} setHasta={setHasta} />

            <ResumenCajas cajas={cierreDia.cajas} onRealizarCierre={guardarCierreDia} isGuardandoCierre={isGuardando} />
            <ResumenVentas ventas={cierreDia} />
        </main>
    );
}
