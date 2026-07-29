import Select from "react-select";
import stylesFiltro from "../../../assets/Css/Dependencias/filtro.module.scss";
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
                ? "linear-gradient(135deg, var(--rojo-600), var(--azul-600))"
                : state.isFocused
                ? "rgba(198, 40, 40, 0.15)"
                : "var(--input-bg)",
            color: state.isSelected ? "#fff" : "var(--texto)",
            cursor: "pointer",
            transition: "background-color var(--transition-fast)",
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: "var(--input-bg)",
            borderColor: state.isFocused ? "var(--rojo-500)" : "var(--input-border)",
            borderRadius: "var(--radius-md)",
            padding: "0.2rem",
            boxShadow: state.isFocused ? "var(--focus-ring)" : "none",
            transition: "all var(--transition-fast)",
            "&:hover": {
                borderColor: "var(--rojo-700)",
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--input-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 100,
        }),
        menuList: (provided) => ({
            ...provided,
            padding: "0.3rem 0",
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "var(--texto)",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "var(--placeholder)",
        }),
        input: (provided) => ({
            ...provided,
            color: "var(--texto)",
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? "var(--rojo-500)" : "var(--texto-sec)",
            transition: "color var(--transition-fast)",
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: "var(--texto-sec)",
            transition: "color var(--transition-fast)",
            "&:hover": {
                color: "var(--rojo-500)",
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
                    Código de Barras
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
                <label>
                    Categoría
                    <Select
                        options={opcionesCategorias}
                        value={
                            opcionesCategorias.find((opt) => opt.value === categoria) ||
                            opcionesCategorias[0]
                        }
                        onChange={(selected) => {
                            setCategoria(selected.value);
                            if (setMarca) setMarca("");
                        }}
                        isClearable
                        placeholder="Seleccionar..."
                        classNamePrefix="react-select"
                        styles={customStyles}
                    />
                </label>
            )}

            {/* 🏷️ Marca */}
            {mostrarMarca && (
                <label>
                    Marca
                    <Select
                        options={opcionesMarcas}
                        value={
                            opcionesMarcas.find((opt) => opt.value === marca) ||
                            opcionesMarcas[0]
                        }
                        onChange={(selected) => setMarca(selected.value)}
                        isClearable
                        placeholder="Seleccionar..."
                        classNamePrefix="react-select"
                        styles={customStyles}
                    />
                </label>
            )}

            {/* Paginación o botones adicionales */}
            {children}
        </div>
    );
}