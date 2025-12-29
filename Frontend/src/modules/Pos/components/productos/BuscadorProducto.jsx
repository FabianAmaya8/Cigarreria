import Select from "react-select";
import styles from "../../../../assets/Css/Pos/productoRow.module.scss";
import {Loading, Error} from "../../../../Utils/Cargando";

export default function BuscadorProducto({ 
    agregarProducto, 
    almacen, 
    productos, 
    isLoading, 
    isError 
}) {

    const options = productos.map((p) => ({
        value: p.id_producto,
        label: `${p.nombre} - $${p.precio_venta}`,
        producto: p,
    }));

    const handleChange = (option) => {
        if (!option) return;
        agregarProducto(option.producto.codigo_barras, 1, almacen);
    };

    if (isLoading) return <Loading />;
    if (isError) return <Error msg="Error al cargar productos" />;

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "var(--rojo-500)"
                : state.isFocused
                ? "rgba(255, 0, 0, 0.15)"
                : "#fff",
            color: state.isSelected
                ? "#fff"
                : "var(--texto-negro)",
            cursor: "pointer",
            transition: "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: "#fff",
            borderColor: state.isFocused
                ? "var(--rojo-500)"
                : "var(--glass)",
            borderRadius: "8px",
            padding: "0.1rem",
            boxShadow: state.isFocused
                ? "0 0 0 3px rgba(255, 0, 0, 0.2)"
                : "none",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
                borderColor: "var(--rojo-500)",
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "#fff",
            border: "1px solid var(--glass)",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
            zIndex: 20,
        }),
        menuList: (provided) => ({
            ...provided,
            padding: "0.3rem 0",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "var(--texto-negro)",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "var(--placeholder)",
        }),
        input: (provided) => ({
            ...provided,
            color: "var(--texto-negro)",
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused
                ? "var(--rojo-500)"
                : "var(--texto-negro)",
            transition: "color 0.2s ease-in-out",
            "&:hover": {
                color: "var(--rojo-400)",
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: "var(--texto-negro)",
            "&:hover": {
                color: "var(--rojo-400)",
            },
        }),
    };

    return (
        <div className={styles.buscador}>
            <Select
                options={options}
                onChange={handleChange}
                placeholder="Buscar producto..."
                isClearable
                isSearchable
                noOptionsMessage={() => "Sin resultados"}
                styles={customStyles}
            />
        </div>
    );
}
