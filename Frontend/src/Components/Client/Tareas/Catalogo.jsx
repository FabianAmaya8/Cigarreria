import styles from "../../../assets/Css/index.module.scss";
import stylesFiltro from "../../../assets/Css/deuda.module.scss";
import stylesCatalogo from "../../../assets/Css/catalogo.module.scss";
import stylesBoton from "../../../assets/Css/crud.module.scss";
import { Loading, Error } from "../../../Utils/Cargando";
import useCatalogo from "../../../Hooks/Client/useCatalogo";
import { useMemo, useState } from "react";
import Filtro from "../../Vendedor/GestionInventario/Filtro";
import Paginacion from "../../Vendedor/GestionInventario/Paginacion";
import { useAuthContext } from "../../../Pages/Context/AuthContext";

export default function Catalogo() {
    const { data: Productos, isLoading, error } = useCatalogo();

    const [categoria, setCategoria] = useState("");
    const [marca, setMarca] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [codigoBarras, setCodigoBarras] = useState("");

    const [estado, setEstado] = useState(false);

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
            if (!estado && p.activo === false) return false;

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
    }, [Productos, categoria, marca, busqueda, codigoBarras, estado]);

    // 🧭 Estados para paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // 🧮 Productos paginados
    const productosPaginados = useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return productosFiltrados.slice(start, end);
    }, [productosFiltrados, page, rowsPerPage]);

    // 🔁 Manejo de cambio de página
    const handleChangePage = (newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const mensajeError =
        error?.response?.status === 403
            ? "No autorizado para ver este catálogo"
            : "Ocurrió un error al cargar los productos";

    return (
        <main className={`${styles.Container} ${stylesFiltro.Container}`}>

            <h2>Catálogo</h2>

            {/* Filtros */}
            <Filtro
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                codigoBarras={codigoBarras}
                setCodigoBarras={setCodigoBarras}
                categoria={categoria}
                setCategoria={setCategoria}
                marca={marca}
                setMarca={setMarca}
                categorias={categorias}
                marcas={marcas}
                mostrarBusqueda={true}
                mostrarCodigo={true}
                mostrarCategoria={true}
                mostrarMarca={true}
            >
                <FiltroActivo estado={estado} setEstado={setEstado} />

                <Paginacion
                    page={page}
                    rowsPerPage={rowsPerPage}
                    total={productosFiltrados.length}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Filtro>

            {/* Listado productos */}
            <div className={stylesCatalogo.cartProducto}>
                {isLoading && <Loading />}
                {error && <Error msg={mensajeError} errorCode={error} />}
                {productosPaginados.map((p) => (
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
        activo,
    } = Producto;

    return (
        <div key={id_producto} className={stylesCatalogo.cartProductoItem}>
            <div className={stylesCatalogo.ImagenProducto}>
                {imagen ? <img src={imagen} alt={nombre} /> : <i className="bx bx-image"></i>}
            </div>

            {!activo && 
                <p className={stylesCatalogo.ProductoInactivo}>
                    Producto inactivo
                </p>
            }

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

export function FiltroActivo({estado, setEstado}){
    const { user } = useAuthContext();

    return(
        <>
            {(user?.rol === 1 || user?.rol === 2) && (
                <label className={`${stylesBoton.SwitchLabel} ${stylesCatalogo.FiltroActivo}`}>
                    <span className={stylesBoton.SwitchText}>
                        {estado ? "Todos los Productos" : "Productos Acual"}
                    </span>
                    <input
                        type="checkbox"
                        name="activo"
                        checked={estado}
                        onChange={(e) => setEstado(e.target.checked)}
                    />
                    <span className={stylesBoton.Switch}></span>
                </label>
            )}
        </>
    )
}

function formatPrice(price) {
    return `$ ${new Intl.NumberFormat("es-ES", { useGrouping: true }).format(price)}`;
}
