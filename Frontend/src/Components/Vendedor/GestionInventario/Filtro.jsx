import Select from "react-select";
import stylesFiltro from "../../../assets/Css/deuda.module.scss";
import { useAuthContext } from "../../../Pages/Context/AuthContext";

export default function Filtro({
    busqueda,
    setBusqueda,
    codigoBarras,
    setCodigoBarras,
    categoria,
    setCategoria,
    marca,
    setMarca,
    categorias = [],
    marcas = [],
    mostrarBusqueda = true,
    mostrarCodigo = false,
    mostrarCategoria = false,
    mostrarMarca = false,
    children,
}) {
    const { user } = useAuthContext();

    // 🔧 Convertimos las listas en opciones para react-select
    const opcionesCategorias = [
        { value: "", label: "Todas las categorías" },
        ...categorias.map((c) => ({ value: c, label: c })),
    ];

    const opcionesMarcas = [
        { value: "", label: "Todas las marcas" },
        ...marcas.map((m) => ({ value: m, label: m })),
    ];

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
        <div className={`${stylesFiltro.Item} ${stylesFiltro.Filtros}`}>
            {/* 🔍 Buscador general */}
            {mostrarBusqueda && (
                <label>
                    Buscar
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </label>
            )}

            {/* 🧾 Código de barras */}
            {mostrarCodigo && (user?.rol === 1 || user?.rol === 2) && (
                <label>
                    Buscar por código de barras
                    <input
                        type="text"
                        placeholder="Ej: 770200100001"
                        value={codigoBarras}
                        onChange={(e) => setCodigoBarras(e.target.value)}
                    />
                </label>
            )}

            {/* 🗂️ Categoría */}
            {mostrarCategoria && (
                <label style={{ width: "100%" }}>
                    Categoría
                    <Select
                        options={opcionesCategorias}
                        value={opcionesCategorias.find((opt) => opt.value === categoria) || opcionesCategorias[0]}
                        onChange={(selected) => {
                            setCategoria(selected.value);
                            if (setMarca) setMarca("");
                        }}
                        isClearable
                        placeholder="Seleccionar categoría..."
                        classNamePrefix="react-select"
                        styles={customStyles}
                    />
                </label>
            )}

            {/* 🏷️ Marca */}
            {mostrarMarca && (
                <label style={{ width: "100%" }}>
                    Marca
                    <Select
                        options={opcionesMarcas}
                        value={opcionesMarcas.find((opt) => opt.value === marca) || opcionesMarcas[0]}
                        onChange={(selected) => setMarca(selected.value)}
                        isClearable
                        placeholder="Seleccionar marca..."
                        classNamePrefix="react-select"
                        styles={customStyles}
                    />
                </label>
            )}

            {children}
        </div>
    );
}

