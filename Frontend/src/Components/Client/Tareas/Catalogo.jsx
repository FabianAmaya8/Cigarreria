import styles from "../../../assets/Css/index.module.scss";
import stylesCatalogo from "../../../assets/Css/catalogo.module.scss";
import stylesFiltro from "../../../assets/Css/deuda.module.scss";
import { Hourglass } from "ldrs/react";
import useCatalogo from "../../../Hooks/Client/useCatalogo";
import { useAuthContext } from "../../../Pages/Context/AuthContext";
import { useMemo, useState } from "react";

export default function Catalogo() {
    const { data: Productos, isLoading, error } = useCatalogo();
    const { user } = useAuthContext();

    const [categoria, setCategoria] = useState("");
    const [marca, setMarca] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [codigoBarras, setCodigoBarras] = useState("");

    // categorías únicas
    const categorias = useMemo(() => {
        if (!Productos) return [];
        const set = new Set(Productos.map((p) => p.marca.categoria.nombre));
        return Array.from(set);
    }, [Productos]);

    // marcas dinámicas según categoría
    const marcas = useMemo(() => {
        if (!Productos) return [];
        let filtradas = Productos;
        if (categoria) {
            filtradas = Productos.filter((p) => p.marca.categoria.nombre === categoria);
        }
        const set = new Set(filtradas.map((p) => p.marca.nombre));
        return Array.from(set);
    }, [Productos, categoria]);

    // productos filtrados
    const productosFiltrados = useMemo(() => {
        if (!Productos) return [];

        let filtrados = Productos.filter((p) => {
            const coincideCategoria = categoria ? p.marca.categoria.nombre === categoria : true;
            const coincideMarca = marca ? p.marca.nombre === marca : true;

            const termino = busqueda.toLowerCase();
            const coincideBusqueda =
                !termino ||
                p.nombre.toLowerCase().includes(termino) ||
                p.marca.nombre.toLowerCase().includes(termino) ||
                p.marca.categoria.nombre.toLowerCase().includes(termino);

            const coincideCodigo = codigoBarras
                ? p.codigo_barras.toString().includes(codigoBarras)
                : true;

            return coincideCategoria && coincideMarca && coincideBusqueda && coincideCodigo;
        });

        if (codigoBarras) {
            filtrados.sort((a, b) => {
                const aExacto = a.codigo_barras.toString() === codigoBarras;
                const bExacto = b.codigo_barras.toString() === codigoBarras;
                return aExacto === bExacto ? 0 : aExacto ? -1 : 1;
            });
        }

        return filtrados;
    }, [Productos, categoria, marca, busqueda, codigoBarras]);


    return (
        <main className={`${styles.Container} ${stylesFiltro.Container}`}>
            <h2>Catálogo</h2>

            {/* Filtros */}
            <div className={`${stylesFiltro.Item} ${stylesFiltro.Filtros}`}>
                <label>
                    Buscar producto / categoría / marca
                    <input
                        type="text"
                        placeholder="Producto / Categoría / Marca"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </label>

                {user?.rol === 1 || user?.rol === 2 ? (
                    <label>
                        Buscar por código de barras
                        <input
                            type="text"
                            placeholder="Ej: 770200100001"
                            value={codigoBarras}
                            onChange={(e) => setCodigoBarras(e.target.value)}
                        />
                    </label>
                ) : null}

                <label>
                    Categoría
                    <select
                        value={categoria}
                        onChange={(e) => {
                            setCategoria(e.target.value);
                            setMarca(""); 
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
            </div>

            {/* Listado productos */}
            <div className={stylesCatalogo.cartProducto}>
                {isLoading && (
                    <div className="cargando">
                        <Hourglass size="150" color="var(--rojo-500)" />
                    </div>
                )}

                {error && (
                    <div className="cargando">
                        {error?.response?.status === 403
                            ? "No autorizado para ver este catálogo"
                            : "Ocurrió un error al cargar los productos"}
                    </div>
                )}

                {productosFiltrados.map((p) => (
                    <CartProducto key={p.id_producto} Producto={p} />
                ))}
            </div>
        </main>
    );
}

export function CartProducto({ Producto }) {
    const { user } = useAuthContext();
    const {
        id_producto,
        codigo_barras,
        nombre,
        descripcion,
        imagen,
        precio_venta,
        stock_actual,
        marca,
    } = Producto;

    return (
        <div key={id_producto} className={stylesCatalogo.cartProductoItem}>
            <div className={stylesCatalogo.ImagenProducto}>
                {imagen ? <img src={imagen} alt={nombre} /> : <i className="bx bx-image"></i>}
            </div>

            <h3>{nombre}</h3>

            <div className={stylesCatalogo.InfoProducto}>
                <p>
                    <b>categoría</b> {marca.categoria.nombre}
                </p>
                <p>
                    <b>marca</b> {marca.nombre}
                </p>
            </div>

            <p>
                <b>descripción</b> {descripcion}
            </p>
            <p>
                <b>precio</b> {formatPrice(precio_venta)}
            </p>

            {user?.rol === 1 || user?.rol === 2 ? (
                <>
                    <p>
                        <b>stock</b> {stock_actual}
                    </p>
                    <p>
                        <b>código de barras</b> {codigo_barras}
                    </p>
                </>
            ) : null}
        </div>
    );
}

function formatPrice(price) {
    return `$ ${new Intl.NumberFormat("es-ES", { useGrouping: true }).format(price)}`;
}
