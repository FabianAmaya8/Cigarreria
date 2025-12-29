import styles from "../../../../assets/Css/Pos/posHeader.module.scss";
import logo from "../../../../assets/logo.png";
import { POS_CONFIG } from "../../config/pos.config";
import { Info, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthContext } from "../../../../Pages/Context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function PosHeader({ mesaActiva, estadoMesa }) {
    const { isAuthenticated } = useAuthContext();
    const imagen = sessionStorage.getItem("imagen");
    const [teclas, setTeclas] = useState(POS_CONFIG.HOTKEYS);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <header className={styles.header}>
            <NavLink to="/" className={styles.logo}>
                <img src={logo} alt="Logo" />
            </NavLink>

            <div className={styles.left}>
                <h2>POS</h2>
                <span className={styles.mesa}>
                    Mesa: <strong>{mesaActiva}</strong>
                </span>
                <span
                    className={`${styles.estado} ${
                        estadoMesa === "abierta"
                            ? styles.abierta
                            : styles.cerrada
                    }`}
                >
                    {estadoMesa}
                </span>
            </div>

            <button className={styles.teclas} onClick={() => setModalOpen(!modalOpen)}>
                <Info size={18} />
                Ver teclas
            </button>

            {isAuthenticated ?
            (
                <NavLink to="/Personal" className={styles.perfil}>
                    {imagen ? (
                        <img src={imagen} alt="Imagen de Perfil" />
                    ) : (
                        <i className="bx bx-user "></i>
                    )
                    }
                </NavLink>
            ): null}

            <ModalTeclas
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                teclas={teclas}
            />
        </header>
    );
}


export function ModalTeclas({ modalOpen, setModalOpen, teclas }) {
    const modalRef = useRef(null);

    // 🔑 Cerrar con Escape
    useEffect(() => {
        if (!modalOpen) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setModalOpen(false);
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [modalOpen, setModalOpen]);

    if (!modalOpen) return null;

    return (
        <div
            className={styles.backdrop}
            onClick={() => setModalOpen(false)}
        >
            <div
                className={styles.modal}
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* HEADER */}
                <header className={styles.modalHeader}>
                    <h3>Atajos de teclado</h3>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setModalOpen(false)}
                        aria-label="Cerrar"
                    >
                        <X size={18} />
                    </button>
                </header>

                {/* BODY */}
                <div className={styles.modalBody}>
                    {Object.entries(teclas).map(([accion, { key, label }]) => (
                        <div key={accion} className={styles.teclaRow}>
                            <span className={styles.label}>{label}</span>
                            <kbd className={styles.key}>{key}</kbd>
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <footer className={styles.modalFooter}>
                    <button onClick={() => setModalOpen(false)}>
                        Cerrar
                    </button>
                </footer>
            </div>
        </div>
    );
}