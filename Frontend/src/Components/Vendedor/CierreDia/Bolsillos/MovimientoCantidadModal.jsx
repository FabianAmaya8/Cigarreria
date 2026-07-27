import MovimientoMontoModal from "./MovimientoMontoModal";

export default function MovimientoCantidadModal({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    mode = "entrada",
    pocketName,
    saldoDisponible,
}) {
    const title = mode === "entrada" ? "Agregar cantidad" : "Sacar cantidad";
    const subtitle = mode === "entrada" ? `Nuevo ingreso en ${pocketName}` : `Salida desde ${pocketName}`;
    const confirmLabel = mode === "entrada" ? "Agregar cantidad" : "Sacar cantidad";
    const amountHint =
        saldoDisponible != null ? `Saldo disponible para operar: $${Number(saldoDisponible).toLocaleString("es-CO")}` : undefined;

    return (
        <MovimientoMontoModal
            open={open}
            onClose={onClose}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            title={title}
            subtitle={subtitle}
            confirmLabel={confirmLabel}
            amountHint={amountHint}
        />
    );
}
