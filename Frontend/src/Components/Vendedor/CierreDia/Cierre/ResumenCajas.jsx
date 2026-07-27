import { useState } from "react";
import { FaCashRegister, FaWallet, FaRegFolderOpen } from "react-icons/fa6";
import styles from "../../../../assets/Css/CierraDia/CierreDia.module.scss";
import { formatMoney } from "../cierreDia.utils";
import CierreDiaModal from "./CierreDiaModal";
import CierreDiaResultadoModal from "./CierreDiaResultadoModal";

export default function ResumenCajas({
    cajas = [],
    onRealizarCierre,
    isGuardandoCierre = false,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resultadoCierre, setResultadoCierre] = useState(null);

    async function handleRealizarCierre(payload) {
        if (!onRealizarCierre) return;
        const response = await onRealizarCierre(payload);
        setIsModalOpen(false);
        setResultadoCierre(response);
        return response;
    }

    return (
        <section className={styles.containerCart}>
            <header className={styles.sectionHeader}>
                <div>
                    <span className={styles.sectionKicker}>Control interno</span>
                    <h3>Cajas</h3>
                </div>

                <div className={styles.sectionActions}>
                    <span className={styles.sectionTag}>{cajas.length} activas</span>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <FaCashRegister />
                        Realizar cierre del dia
                    </button>
                </div>
            </header>

            {cajas.length === 0 ? (
                <div className={styles.emptyState}>
                    <FaRegFolderOpen />
                    <p>No hay cajas para mostrar en este rango.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {cajas.map((caja) => (
                        <article key={caja.id_caja} className={styles.card}>
                            <div className={styles.cardTopLine}>
                                <span className={styles.nombre}>{caja.nombre}</span>
                                <FaWallet />
                            </div>
                            <span className={styles.saldo}>{formatMoney(caja.saldo_actual)}</span>
                            <small className={styles.helperText}>Saldo actual registrado</small>
                        </article>
                    ))}
                </div>
            )}

            <CierreDiaModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleRealizarCierre}
                isSubmitting={isGuardandoCierre}
            />

            <CierreDiaResultadoModal
                open={Boolean(resultadoCierre)}
                data={resultadoCierre}
                onClose={() => setResultadoCierre(null)}
            />
        </section>
    );
}
