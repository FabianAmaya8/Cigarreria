import styles from "../../../assets/Css/Vendedor/Compras.module.scss";

function ModalShell({
    open,
    title,
    subtitle,
    onClose,
    children,
    narrow = false,
}) {
    if (!open) return null;

    return (
        <div className={styles.modalBackdrop} onMouseDown={onClose}>
            <div
                className={`${styles.modal} ${
                    narrow ? styles.modalNarrow : ""
                }`}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className={styles.modalHeader}>
                    <div>
                        <h3>{title}</h3>
                        {subtitle ? <p>{subtitle}</p> : null}
                    </div>

                    <button
                        type="button"
                        className={styles.modalClose}
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <i className="bx bx-x" />
                    </button>
                </header>

                {children}
            </div>
        </div>
    );
}

export default ModalShell;