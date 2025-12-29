import { forwardRef, useImperativeHandle, useRef } from "react";
import styles from "../../../../assets/Css/Pos/productoRow.module.scss";
import Select from "react-select";
import { Warehouse, ShoppingBasket } from "lucide-react";

export const ScanInput = forwardRef(function ScanInput(
    { agregarProducto, loading, almacen },
    ref
) {
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus() {
            inputRef.current?.focus();
        },
        clear() {
            if (inputRef.current) inputRef.current.value = "";
        }
    }));

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const codigo = e.target.value.trim();
            if (!codigo) return;

            agregarProducto(codigo, 1, almacen);
            e.target.value = "";
        }
    };

    return (
        <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Escanear código de barras..."
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
        />
    );
});


/* =========================
    SELECTOR DE ALMACÉN
========================= */
export function SelectorAlmacen({ almacen, setAlmacen }) {

    /* Opciones */
    const opcionesAlmacen = [
        {
            value: 1,
            label: "Bodega",
            icon: <Warehouse size={40} color="var(--azul-500)" />
        },
        {
            value: 2,
            label: "Vitrina",
            icon: <ShoppingBasket size={40} color="var(--azul-500)" />
        }
    ];

    /* Opción en el menú */
    const OpcionAlmacen = ({ data, innerRef, innerProps }) => (
        <div
            ref={innerRef}
            {...innerProps}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.3rem 0.6rem",
                color: "var(--texto-negro)"
            }}
        >
            {data.icon}
            <b>{data.label}</b>
        </div>
    );

    /* Valor seleccionado */
    const ValorSeleccionado = ({ data }) => (
        <div style={{ 
            display: "flex",
            flexDirection: "column", 
            alignItems: "center", 
            gap: "0.4rem",
            color: "var(--texto-negro)" 
        }}>
            {data.icon}
            <b>{data.label}</b>
        </div>
    );

    /* Estilos */
    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "var(--rojo-500)"
                : state.isFocused
                ? "rgba(255, 0, 0, 0.15)"
                : "#fff",
            color: state.isSelected ? "#fff" : "var(--texto-negro)",
            cursor: "pointer"
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: "#fff",
            borderColor: state.isFocused
                ? "var(--rojo-500)"
                : "var(--glass)",
            borderRadius: "8px",
            minHeight: "38px",
            boxShadow: state.isFocused
                ? "0 0 0 3px rgba(255, 0, 0, 0.2)"
                : "none",
            "&:hover": {
                borderColor: "var(--rojo-500)"
            }
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: "8px",
            zIndex: 20
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "var(--texto-negro)"
        })
    };

    /* Cambio de almacén */
    const handleChange = (opcion) => {
        setAlmacen(opcion.value);
    };

    return (
        <Select
            className={styles.select}
            placeholder={null}
            value={
                opcionesAlmacen.find(o => o.value === Number(almacen)) 
                || opcionesAlmacen[0]
            }
            onChange={handleChange}
            options={opcionesAlmacen}
            isSearchable={false}
            styles={customStyles}
            components={{
                Option: OpcionAlmacen,
                SingleValue: ValorSeleccionado,
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null
            }}
        />
    );

}
