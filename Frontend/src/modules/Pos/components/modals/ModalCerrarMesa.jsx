import styles from "../../../../assets/Css/Pos/modalCerrarMesa.module.scss";
import {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useRef,
} from "react";
import Select, { components } from "react-select";
import Swal from "sweetalert2";
import {
    X,
    Plus,
    Trash2,
    CheckCircle,
    CreditCard,
    User,
} from "lucide-react";

const ModalCerrarMesa = forwardRef(function ModalCerrarMesa({
    open,
    tipo,
    total = 0,
    onClose,
    onConfirm,
    formatearPrecio,
    metodosPago = [],
    usuarios = [],
}, ref) {
    const [observaciones, setObservaciones] = useState("");
    const [pagos, setPagos] = useState([
        {
            id: crypto.randomUUID(),
            id_metodo: metodosPago?.[0]?.id_metodo || 1,
            monto: total,
        },
    ]);

    const [idUsuarioDeuda, setIdUsuarioDeuda] = useState(null);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    // =======================
    // REFS PARA AUTOFOCUS
    // =======================
    const inputMontoRef = useRef(null);
    const selectUsuarioRef = useRef(null);

    /* =======================
        EFECTOS
    ======================= */

    useEffect(() => {
        if (!open) return;

        setObservaciones(
            tipo === "deuda"
                ? "Deuda registrada exitosamente."
                : "Venta cerrada exitosamente."
        );

        // Autofocus inteligente
        setTimeout(() => {
            if (tipo === "venta" && inputMontoRef.current) {
                inputMontoRef.current.focus();
                inputMontoRef.current.select();
            }

            if (tipo === "deuda" && selectUsuarioRef.current) {
                selectUsuarioRef.current.focus();
            }
        }, 100);
    }, [tipo, open]);

    useEffect(() => {
        if (!open) {
            setPagos([
                {
                    id: crypto.randomUUID(),
                    id_metodo: metodosPago?.[0]?.id_metodo || 1,
                    monto: total,
                },
            ]);
            setIdUsuarioDeuda(null);
            setUsuarioSeleccionado(null);
        }
    }, [open, total, metodosPago]);

    /* =======================
        CÁLCULOS
    ======================= */

    const totalPagado = pagos.reduce(
        (acc, p) => acc + Number(p.monto || 0),
        0
    );

    /* =======================
        PAGOS
    ======================= */

    const agregarPago = () => {
        const restante = total - totalPagado;

        setPagos([
            ...pagos,
            {
                id: crypto.randomUUID(),
                id_metodo: metodosPago?.[0]?.id_metodo || 1,
                monto: restante > 0 ? restante : 0,
            },
        ]);
    };

    const eliminarPago = (id) => {
        setPagos(pagos.filter((p) => p.id !== id));
    };

    /* =======================
        CONFIRMAR
    ======================= */

    const confirmar = () => {
        if (tipo === "venta" && totalPagado < total) {
            return Swal.fire("Pago insuficiente", "", "warning");
        }

        if (tipo === "deuda" && !idUsuarioDeuda) {
            return Swal.fire("Debe seleccionar un cliente", "", "warning");
        }

        const payload = {
            tipo,
            observaciones,
        };

        if (tipo === "venta") payload.pagos = pagos;
        if (tipo === "deuda") payload.id_usuario_deuda = Number(idUsuarioDeuda);

        onConfirm(payload);
    };

    useImperativeHandle(ref, () => ({ confirmar }));

    /* =======================
        SELECT USUARIOS
    ======================= */

    const opcionesUsuarios = usuarios.map((u) => ({
        value: u.id_usuario,
        label: u.usuario,
        imagen: u.imagen,
    }));

    const CustomOption = (props) => {
        const { data } = props;
        return (
            <components.Option {...props}>
                <div className={styles.optionUser}>
                    <img src={data.imagen} alt={data.label} />
                    <span>{data.label}</span>
                </div>
            </components.Option>
        );
    };

    const CustomSingleValue = (props) => {
        const { data } = props;
        return (
            <components.SingleValue {...props}>
                <div className={styles.optionUser}>
                    <img src={data.imagen} alt={data.label} />
                    <span>{data.label}</span>
                </div>
            </components.SingleValue>
        );
    };

    if (!open) return null;

    /* =======================
        RENDER
    ======================= */

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                <header>
                    <h3>
                        {tipo === "venta" ? (
                            <>
                                <CreditCard size={18} /> Cerrar venta
                            </>
                        ) : (
                            <>
                                <User size={18} /> Cerrar deuda
                            </>
                        )}
                    </h3>
                    <button onClick={onClose}>
                        <X size={18} />
                    </button>
                </header>

                <div className={styles.total}>
                    Total: {formatearPrecio(total)}
                </div>

                {tipo === "venta" && (
                    <div className={styles.pagos}>
                        {pagos.map((p, index) => (
                            <div key={p.id} className={styles.pagoRow}>
                                <select
                                    value={p.id_metodo}
                                    onChange={(e) => {
                                        setPagos(
                                            pagos.map((pg) =>
                                                pg.id === p.id
                                                    ? {
                                                          ...pg,
                                                          id_metodo: Number(
                                                              e.target.value
                                                          ),
                                                      }
                                                    : pg
                                            )
                                        );
                                    }}
                                >
                                    {metodosPago.map((mp) => (
                                        <option
                                            key={mp.id_metodo}
                                            value={mp.id_metodo}
                                        >
                                            {mp.nombre}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    ref={index === 0 ? inputMontoRef : null}
                                    type="number"
                                    value={p.monto}
                                    onChange={(e) => {
                                        setPagos(
                                            pagos.map((pg) =>
                                                pg.id === p.id
                                                    ? {
                                                          ...pg,
                                                          monto: Number(
                                                              e.target.value
                                                          ),
                                                      }
                                                    : pg
                                            )
                                        );
                                    }}
                                />

                                {pagos.length > 1 && (
                                    <button
                                        className={styles.deletePago}
                                        onClick={() => eliminarPago(p.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            className={styles.addPago}
                            onClick={agregarPago}
                            disabled={totalPagado >= total}
                        >
                            <Plus size={16} /> Agregar método
                        </button>

                        <strong>
                            Pagado: {formatearPrecio(totalPagado)}
                        </strong>

                        {totalPagado > total && (
                            <div className={styles.cambio}>
                                Cambio:{" "}
                                {formatearPrecio(totalPagado - total)}
                            </div>
                        )}
                    </div>
                )}

                {tipo === "deuda" && (
                    <div className={styles.pagos}>
                        <Select
                            ref={selectUsuarioRef}
                            options={opcionesUsuarios}
                            value={usuarioSeleccionado}
                            onChange={(opcion) => {
                                setUsuarioSeleccionado(opcion);
                                setIdUsuarioDeuda(opcion?.value || null);
                            }}
                            components={{
                                Option: CustomOption,
                                SingleValue: CustomSingleValue,
                            }}
                            placeholder="Seleccionar cliente"
                            isClearable
                            classNamePrefix="react-select"
                        />
                    </div>
                )}

                <textarea
                    placeholder="Observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                />

                <footer>
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={confirmar}>
                        <CheckCircle size={16} /> Confirmar
                    </button>
                </footer>
            </div>
        </div>
    );
});

export default ModalCerrarMesa;
