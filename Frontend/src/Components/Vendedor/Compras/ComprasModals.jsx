import CompraFormModal from "./CompraFormModal";
import CompraDetalleModal from "./CompraDetalleModal";
import RecepcionModal from "./RecepcionModal";
import PagoModal from "./PagoModal";
import DevolucionModal from "./DevolucionModal";
import CompensacionModal from "./CompensacionModal";
import AbonoCompensacionModal from "./AbonoCompensacionModal";

export default function ComprasModals({ page, styles }) {
    const {
        openForm, modoForm, compraEditar, closeForm, handleCrearCompra, handleActualizarCompra,
        isCreating, isUpdating,
        compraDetalleId, compraDetalle, alertas, setCompraDetalleId,
        setCompraRecepcion, setCompraPago, setCompraDevolucion, setOpenCompensacion,
        compraRecepcion, handleRecepcion, isReceiving,
        compraPago, cajas, bolsillos, handlePago, isPaying,
        compraDevolucion, handleDevolucion, isReturning,
        openCompensacion, handleCompensacion, isCompensating,
        compensacionAbono, setCompensacionAbono, handleAbono, isAbonando,
        setModoForm, setCompraEditar, setOpenForm,
    } = page;

    return (
        <>
            <CompraFormModal
                open={openForm}
                mode={modoForm}
                initialCompra={compraEditar}
                proveedores={page.proveedores || []}
                productos={page.productos || []}
                onClose={closeForm}
                onSubmit={modoForm === "create" ? handleCrearCompra : handleActualizarCompra}
                isSubmitting={isCreating || isUpdating}
            />
            <CompraDetalleModal
                open={Boolean(compraDetalleId)}
                compra={compraDetalle}
                alertas={alertas}
                onClose={() => setCompraDetalleId(null)}
                onEdit={() => {
                    setModoForm("edit");
                    setCompraEditar(compraDetalle);
                    setCompraDetalleId(null);
                    setOpenForm(true);
                }}
                onReceive={() => setCompraRecepcion(compraDetalle)}
                onPay={() => setCompraPago(compraDetalle)}
                onReturn={() => setCompraDevolucion(compraDetalle)}
                onCompensate={() => setOpenCompensacion(true)}
            />
            <RecepcionModal
                open={Boolean(compraRecepcion)}
                compra={compraRecepcion}
                onClose={() => setCompraRecepcion(null)}
                onSubmit={handleRecepcion}
                isSubmitting={isReceiving}
            />
            <PagoModal
                open={Boolean(compraPago)}
                compra={compraPago}
                cajas={cajas || []}
                bolsillos={bolsillos || []}
                onClose={() => setCompraPago(null)}
                onSubmit={handlePago}
                isSubmitting={isPaying}
            />
            <DevolucionModal
                open={Boolean(compraDevolucion)}
                compra={compraDevolucion}
                onClose={() => setCompraDevolucion(null)}
                onSubmit={handleDevolucion}
                isSubmitting={isReturning}
            />
            <CompensacionModal
                open={openCompensacion}
                cajas={cajas || []}
                bolsillos={bolsillos || []}
                onClose={() => setOpenCompensacion(false)}
                onSubmit={handleCompensacion}
                isSubmitting={isCompensating}
                initialData={{}}
            />
            <AbonoCompensacionModal
                open={Boolean(compensacionAbono)}
                compensacion={compensacionAbono}
                onClose={() => setCompensacionAbono(null)}
                onSubmit={handleAbono}
                isSubmitting={isAbonando}
            />
        </>
    );
}
