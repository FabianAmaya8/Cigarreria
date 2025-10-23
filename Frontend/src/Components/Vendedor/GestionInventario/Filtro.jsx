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

            {/* 🧾 Código de barras (solo si se habilita y el usuario tiene rol válido) */}
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
                <label>
                    Categoría
                    <select
                        value={categoria}
                        onChange={(e) => {
                            setCategoria(e.target.value);
                            if (setMarca) setMarca(""); // reset marca si aplica
                        }}
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {/* 🏷️ Marca */}
            {mostrarMarca && (
                <label>
                    Marca
                    <select value={marca} onChange={(e) => setMarca(e.target.value)}>
                        <option value="">Todas las marcas</option>
                        {marcas.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {children}
        </div>
    );
}
