import { useEffect, useMemo, useState } from "react";
import styles from "../../../../assets/Css/CierraDia/Bolsillos.module.scss";
import { detactarEstadoCierre } from "../cierreDia.utils";
import BolsilloSummary from "./BolsilloSummary";
import BolsilloProgress from "./BolsilloProgress";
import BolsilloCard from "./BolsilloCard";
import BolsilloActivity from "./BolsilloActivity";
import BolsilloModal from "./BolsilloModal";
import MovimientoCantidadModal from "./MovimientoCantidadModal";
import PagoBolsilloModal from "./PagoBolsilloModal";

const colorOptions = [
    "#c62828",
    "#6d1414",
    "#2b6fa3",
    "#1e4a6a",
    "#27ae60",
    "#f39c12",
    "#8e44ad",
    "#00897b",
    "#ff7043",
    "#3949ab",
];

const initialForm = {
    nombre: "",
    descripcion: "",
    color: colorOptions[0],
    icono: "wallet",
    saldo_actual: "0",
};

export default function ListaBolsillos({
    bolsillos = [],
    movimientos = [],
    totalDisponible = 0,
    totalAsignado = 0,
    totalCierre = 0,
    porcentajeAsignado = 0,
    porcentajeDisponible = 0,
    onCreate,
    onUpdate,
    onDelete,
    onMove,
    onPay,
    isCreando = false,
    isActualizando = false,
    isEliminando = false,
    isMoviendo = false,
    isPagando = false,
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPocket, setEditingPocket] = useState(null);
    const [movementPocket, setMovementPocket] = useState(null);
    const [movementMode, setMovementMode] = useState("entrada");
    const [paymentPocket, setPaymentPocket] = useState(null);
    const [modalData, setModalData] = useState(initialForm);
    const [notice, setNotice] = useState("");

    const isBusy = isCreando || isActualizando || isEliminando || isMoviendo || isPagando;
    const { estado: estadoCierre } = useMemo(
        () => detactarEstadoCierre(totalCierre, totalAsignado, totalDisponible),
        [totalCierre, totalAsignado, totalDisponible]
    );

    useEffect(() => {
        if (!isCreateOpen) {
            setEditingPocket(null);
            setMovementPocket(null);
            setPaymentPocket(null);
            setModalData(initialForm);
        }
    }, [isCreateOpen]);

    function openCreateModal() {
        setEditingPocket(null);
        setModalData(initialForm);
        setNotice("");
        setIsCreateOpen(true);
    }

    function openEditModal(pocket) {
        setEditingPocket(pocket);
        setModalData({
            nombre: pocket.nombre || "",
            descripcion: pocket.descripcion || "",
            color: pocket.color || colorOptions[0],
            icono: pocket.icono || "wallet",
            saldo_actual: String(Number(pocket.saldo_actual || 0)),
        });
        setNotice("");
        setIsCreateOpen(true);
    }

    function openMovementModal(pocket, mode) {
        setMovementPocket(pocket);
        setMovementMode(mode);
        setPaymentPocket(null);
        setNotice("");
    }

    function openPaymentModal(pocket) {
        setPaymentPocket(pocket);
        setMovementPocket(null);
        setNotice("");
    }

    async function handleCreateOrUpdate(payload) {
        if (editingPocket) {
            await onUpdate({
                id_bolsillo: editingPocket.id_bolsillo,
                nombre: payload.nombre,
                descripcion: payload.descripcion,
                color: payload.color,
                icono: payload.icono,
            });
            setNotice("Bolsillo actualizado correctamente.");
            return;
        }

        await onCreate({
            ...payload,
            saldo_actual: Number(payload.saldo_actual || 0),
        });
        setNotice("Bolsillo creado correctamente.");
    }

    async function handleDelete(pocket) {
        if (isBusy) return;

        const confirmDelete = window.confirm(
            `¿Eliminar ${pocket.nombre}? El saldo se devolvera al total disponible.`
        );

        if (!confirmDelete) return;

        try {
            await onDelete(pocket.id_bolsillo);
            setNotice("Bolsillo eliminado correctamente.");
        } catch (submissionError) {
            setNotice(submissionError?.message || "No se pudo eliminar el bolsillo.");
        }
    }

    async function handleMovementSubmit(payload) {
        if (!movementPocket) return;
        await onMove({
            id_bolsillo: movementPocket.id_bolsillo,
            id_caja: 1,
            tipo: movementMode,
            monto: payload.monto,
            motivo: payload.motivo,
        });
        setNotice(
            movementMode === "entrada"
                ? "Cantidad agregada correctamente."
                : "Cantidad retirada correctamente."
        );
        setMovementPocket(null);
    }

    async function handlePagoSubmit(payload) {
        if (!paymentPocket) return;
        await onPay({
            id_bolsillo: paymentPocket.id_bolsillo,
            id_caja: 1,
            monto: payload.monto,
            motivo: payload.motivo,
        });
        setNotice("Pago registrado correctamente.");
        setPaymentPocket(null);
    }

    return (
        <section className={styles.panel}>
            <header className={styles.panelHeader}>
                <div>
                    <span className={styles.kicker}>Organizacion del cierre</span>
                    <h3>Bolsillos del dia</h3>
                    <p className={styles.panelLead}>
                        Distribuye el dinero del cierre en objetivos visuales sin mover dinero real.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={openCreateModal}
                    disabled={isBusy}
                >
                    Nuevo bolsillo
                </button>
            </header>

            {notice ? <p className={styles.notice}>{notice}</p> : null}

            <BolsilloSummary
                totalCierre={totalCierre}
                totalAsignado={totalAsignado}
                totalDisponible={totalDisponible}
                porcentajeAsignado={porcentajeAsignado}
                porcentajeDisponible={porcentajeDisponible}
                estadoCierre={estadoCierre}
            />

            <BolsilloProgress
                totalAsignado={totalAsignado}
                totalDisponible={totalDisponible}
                porcentajeAsignado={porcentajeAsignado}
            />

            {bolsillos.length === 0 ? (
                <div className={styles.emptyState}>
                    <strong>No hay bolsillos creados</strong>
                    <p>Crea el primero para empezar a repartir el dinero del cierre.</p>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={openCreateModal}
                        disabled={isBusy}
                    >
                        Crear bolsillo
                    </button>
                </div>
            ) : (
                <div className={styles.listGrid}>
                    {bolsillos.map((pocket, index) => (
                        <BolsilloCard
                            key={pocket.id_bolsillo}
                            pocket={pocket}
                            accent={pocket.color || colorOptions[index % colorOptions.length]}
                            icon={pocket.icono || "wallet"}
                            totalCierre={totalCierre}
                            onEdit={openEditModal}
                            onOpenMovimiento={openMovementModal}
                            onOpenPago={openPaymentModal}
                            onDelete={handleDelete}
                            isBusy={isBusy}
                        />
                    ))}
                </div>
            )}

            <BolsilloActivity movimientos={movimientos} />

            <BolsilloModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateOrUpdate}
                isSubmitting={isBusy}
                initialData={editingPocket || modalData}
                colorOptions={colorOptions}
            />

            <MovimientoCantidadModal
                open={Boolean(movementPocket)}
                onClose={() => setMovementPocket(null)}
                onSubmit={handleMovementSubmit}
                isSubmitting={isBusy}
                mode={movementMode}
                pocketName={movementPocket?.nombre || ""}
                saldoDisponible={movementPocket?.saldo_actual}
            />

            <PagoBolsilloModal
                open={Boolean(paymentPocket)}
                onClose={() => setPaymentPocket(null)}
                onSubmit={handlePagoSubmit}
                isSubmitting={isBusy}
                pocketName={paymentPocket?.nombre || ""}
                saldoDisponible={paymentPocket?.saldo_actual}
            />
        </section>
    );
}
