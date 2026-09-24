import { Loading, Error } from "../../../Utils/Components/Cargando";
import { useComprasPage } from "../../../Hooks/Vendedor/Compras/useComprasPage";
import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

import ComprasHero from "./ComprasHero";
import CompraFilters from "./CompraFilters";
import CompraStats from "./CompraStats";
import ComprasTable from "./ComprasTable";
import ComprasSecondarySections from "./ComprasSecondarySections";
import ComprasModals from "./ComprasModals";

export default function Compras() {
    const page = useComprasPage();

    if (page.isLoading) return <Loading />;
    if (page.error) {
        return <Error msg={page.error.message || "No se pudieron cargar las compras"} />;
    }

    return (
        <main className={styles.pageShell}>
            <ComprasHero
                styles={styles}
                onNewCompra={page.openCreate}
                onNewCompensacion={() => page.setOpenCompensacion(true)}
            />

            <CompraFilters
                styles={styles}
                busqueda={page.busqueda}
                setBusqueda={page.setBusqueda}
                idProveedor={page.idProveedor}
                setIdProveedor={page.setIdProveedor}
                estadoPago={page.estadoPago}
                setEstadoPago={page.setEstadoPago}
                estadoRecepcion={page.estadoRecepcion}
                setEstadoRecepcion={page.setEstadoRecepcion}
                proveedores={page.proveedores || []}
            />

            <CompraStats styles={styles} stats={page.stats} />

            <ComprasTable
                styles={styles}
                compras={page.comprasFiltradas}
                onView={page.setCompraDetalleId}
                onEdit={page.openEdit}
                onReceive={page.setCompraRecepcion}
                onPay={page.setCompraPago}
                onReturn={page.setCompraDevolucion}
            />

            <ComprasSecondarySections
                styles={styles}
                compensacionesPendientes={page.compensacionesPendientes || []}
                productos={page.productos || []}
                proveedores={page.proveedores || []}
                bolsillos={page.bolsillos || []}
                cajas={page.cajas || []}
                onAbonarCompensacion={page.setCompensacionAbono}
            />

            <ComprasModals page={page} styles={styles} />
        </main>
    );
}
