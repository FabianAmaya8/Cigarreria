import MovimientoMontoModal from "./MovimientoMontoModal";

export default function PagoBolsilloModal({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    pocketName,
    saldoDisponible,
}) {
    return (
        <MovimientoMontoModal
            open={open}
            onClose={onClose}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            title="Hacer pago"
            subtitle={`Registrar un pago desde ${pocketName}`}
            confirmLabel="Registrar pago"
            amountHint={
                saldoDisponible != null
                    ? `Saldo actual del bolsillo: $${Number(saldoDisponible).toLocaleString("es-CO")}`
                    : undefined
            }
        />
    );
}
