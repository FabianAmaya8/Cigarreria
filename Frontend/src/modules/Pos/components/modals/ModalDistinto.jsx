import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import styles from "../../../../assets/Css/Pos/modalDistinto.module.scss";

const ModalDistinto = forwardRef(function ModalDistinto({
    open,
    tipo = "recarga",
    onClose,
    onConfirm,
}, ref) {
    const [valor, setValor] = useState("");

    useEffect(() => {
        if (!open) setValor("");
    }, [open]);

    const handleConfirm = () => {
        if (!valor || Number(valor) <= 0) return;
        onConfirm(Number(valor));
    };

    useImperativeHandle(ref, () => ({
        confirmar: handleConfirm,
    }));

    if (!open) return null;

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                {/* HEADER */}
                <header className={styles.header}>
                    <h3>
                        {tipo === "recarga"
                            ? "Agregar recarga"
                            : "Agregar chance"}
                    </h3>
                    <button onClick={onClose}>✖</button>
                </header>

                {/* CAMPO */}
                <div className={styles.field}>
                    <label>Valor</label>
                    <input
                        type="number"
                        min={1}
                        autoFocus
                        placeholder="Ingrese el valor"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleConfirm();
                            }
                        }}
                    />
                </div>

                {/* ACCIONES */}
                <footer className={styles.footer}>
                    <button onClick={onClose}>
                        Cancelar
                    </button>

                    <button
                        className={styles.confirm}
                        onClick={handleConfirm}
                        disabled={!valor || Number(valor) <= 0}
                    >
                        Confirmar
                    </button>
                </footer>
            </div>
        </div>
    );
});

export default ModalDistinto;
