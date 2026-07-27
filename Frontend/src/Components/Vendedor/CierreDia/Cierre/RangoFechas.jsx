import { useNavigate } from "react-router-dom";
import styles from "../../../../assets/Css/CierraDia/CierreDia.module.scss";

export default function RangoFechas({ desde, hasta, setDesde, setHasta }) {
    const navigate = useNavigate();

    return (
        <>
            <div className={styles.rangeActions}>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => navigate("/CierreDia/Bolsillos")}
                >
                    Ver vista de bolsillos
                </button>
            </div>
            <section className={styles.range}>
                <div className={styles.rangeItem}>
                    <label>Desde</label>
                    <input type="date" value={desde} onChange={(event) => setDesde(event.target.value)} />
                </div>

                <div className={styles.rangeItem}>
                    <label>Hasta</label>
                    <input type="date" value={hasta} onChange={(event) => setHasta(event.target.value)} />
                </div>

            </section>
        </>
    );
}
