import { useEffect, useState } from "react";
import styles from "../../../../assets/Css/Pos/productoRow.module.scss";
import { Trash2, CircleStar } from 'lucide-react';

export default function DistintoRow({
    distinto,
    tipo,
    onConfirmCantidad,
    onRemove,
    formatearPrecio
}) {
    const [valorLocal, setValorLocal] = useState(distinto.valor);

    useEffect(() => {
        setValorLocal(distinto.valor);
    }, [distinto.valor]);

    return (
        <div className={styles.row}>
            <div className={styles.nombre}>
                {tipo.toUpperCase()} #{distinto.id}
            </div>

            <div className={styles.controles}>
                <input
                    type="number"
                    min={1}
                    value={valorLocal}
                    onChange={(e) =>
                        setValorLocal(Number(e.target.value))
                    }
                />

                <button
                    className={styles.ok}
                    onClick={() =>
                        onConfirmCantidad(valorLocal)
                    }
                >
                    <CircleStar />
                </button>
            </div>

            <div className={styles.subtotalGrande}>
                {formatearPrecio(distinto.valor)}
            </div>

            <button className={styles.remove} onClick={onRemove}>
                <Trash2 />
            </button>
        </div>
    );
}
