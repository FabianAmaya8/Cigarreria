import { POS_CONFIG } from "../../config/pos.config";
import MesaButton from "./MesaButton";
import styles from "../../../../assets/Css/Pos/mesas.module.scss";
import { CirclePlus } from "lucide-react";

export default function MesasPanel({
    mesas,
    mesaActiva,
    cambiarMesa,
    onNuevaMesa,
}) {
    const { HOTKEYS } = POS_CONFIG;
    const mesaRapida= POS_CONFIG.MESA_RAPIDA_ID

    return (
        <div className={styles.panel}>
            {/* Mesa rápida */}
            <MesaButton
                id={mesaRapida}
                label={
                    <>
                        Rápida
                        {HOTKEYS?.MESA_RAPIDA && (
                            <kbd className={styles.hotkey}>
                                ({HOTKEYS.MESA_RAPIDA.key})
                            </kbd>
                        )}
                    </>
                }
                activa={mesaActiva === mesaRapida}
                onClick={() => cambiarMesa(mesaRapida)}
            />

            {/* Mesas dinámicas */}
            {mesas.map((m, index) => (
                <MesaButton
                    key={m.id_mesa}
                    id={m.id_mesa}
                    activa={mesaActiva === m.id_mesa}
                    onClick={() => cambiarMesa(m.id_mesa)}
                    label={
                        <>
                            Mesa {m.id_mesa}
                        </>
                    }
                />
            ))}

            {/* Nueva mesa */}
            <button
                className={styles.nuevaMesa}
                onClick={onNuevaMesa}
            >
                <CirclePlus />
                <span>
                    Agregar
                    {HOTKEYS?.NUEVA_MESA && (
                        <kbd className={styles.hotkey}>
                            ({HOTKEYS.NUEVA_MESA.key})
                        </kbd>
                    )}
                </span>
            </button>
        </div>
    );
}
