import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { SquarePlus } from "lucide-react";
import useCrudProductos from "../../../../Hooks/Vendedor/GestionInventario/useCrudProductos";
import useInventario from "../../../../Hooks/Vendedor/GestionInventario/useInventario";
import ProductoForm from "./CrudProductos";
import Filtro from "../Filtro";
import Paginacion from "../Paginacion";
import styles from "../../../../assets/Css/crud.module.scss";
import { Error, Loading } from "../../../../Utils/Components/Cargando";
import ImagePreview from "../../../../Utils/Components/ImagePreview";
import ModalCrearStock from "../CrudAlmacenes/ModalCrearStock";

export default function ProductosView() {
    // 🧩 Hooks principales
    const { productos, isLoadingProductos, errorProductos, crearProducto, actualizarProducto } = useCrudProductos();
    const { crearInventario, isCreando } = useInventario();

    // 🧠 Estados
    const [open, setOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [categoria, setCategoria] = useState("");
    const [marca, setMarca] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [codigoBarras, setCodigoBarras] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openCrear, setOpenCrear] = useState(false);

    // 💲 Formato de precios
    const formatPrice = (price) =>
        `$ ${new Intl.NumberFormat("es-ES", { useGrouping: true }).format(price)}`;

    // 🏷️ Categorías únicas
    const categorias = useMemo(() => {
        if (!productos) return [];
        const set = new Set(productos.map((p) => p.marca?.categoria?.nombre));
        return Array.from(set);
    }, [productos]);

    // 🏷️ Marcas según categoría
    const marcas = useMemo(() => {
        if (!productos) return [];
        let filtradas = productos;
        if (categoria) filtradas = productos.filter((p) => p.marca?.categoria?.nombre === categoria);
        const set = new Set(filtradas.map((p) => p.marca?.nombre));
        return Array.from(set);
    }, [productos, categoria]);

    // 🔍 Filtrado de productos
    const productosFiltrados = useMemo(() => {
        if (!productos) return [];
        let filtrados = productos.filter((p) => {
            const coincideCategoria = categoria ? p.marca?.categoria?.nombre === categoria : true;
            const coincideMarca = marca ? p.marca?.nombre === marca : true;
            const termino = busqueda.toLowerCase();
            const coincideBusqueda =
                !termino ||
                p.nombre.toLowerCase().includes(termino) ||
                p.marca?.nombre.toLowerCase().includes(termino) ||
                p.marca?.categoria?.nombre.toLowerCase().includes(termino);
            const coincideCodigo = codigoBarras
                ? p.codigo_barras.toString().includes(codigoBarras)
                : true;
            return coincideCategoria && coincideMarca && coincideBusqueda && coincideCodigo;
        });

        // Priorizar coincidencia exacta por código
        if (codigoBarras) {
            filtrados.sort((a, b) => {
                const aExacto = a.codigo_barras.toString() === codigoBarras;
                const bExacto = b.codigo_barras.toString() === codigoBarras;
                return aExacto === bExacto ? 0 : aExacto ? -1 : 1;
            });
        }

        return filtrados;
    }, [productos, categoria, marca, busqueda, codigoBarras]);

    // 📄 Paginación
    const handleChangePage = (newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    // 🧱 Modal producto (crear / editar)
    const handleOpen = (producto = null) => {
        setModoEdicion(!!producto);
        setProductoSeleccionado(producto);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    // 💾 Guardar producto
    const handleGuardar = async (form) => {
        try {
            if (modoEdicion) {
                await actualizarProducto({ id: productoSeleccionado.id_producto, data: form });
                Swal.fire("Actualizado", "El producto fue actualizado correctamente", "success");
            } else {
                await crearProducto(form);
                Swal.fire("Creado", "El producto fue creado correctamente", "success");
            }
            handleClose();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    // 🧮 Productos paginados
    const productosPaginados = productosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // 🚦 Carga o error
    if (isLoadingProductos) return <Loading />;
    if (errorProductos) return <Error msg={errorProductos.message} />;

    return (
        <main className={styles.Contenedor}>
            <h2>Gestión de Productos</h2>

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
                <Paginacion
                    page={page}
                    rowsPerPage={rowsPerPage}
                    total={productosFiltrados.length}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Filtro>

            <section className={styles.TablaSection}>
                <div className={styles.Header}>
                    <button onClick={() => handleOpen()}>
                        <i className="bx bx-plus"></i>
                        Nuevo Producto
                    </button>
                </div>

                <div className={styles.tablaWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Marca</th>
                                <th>Categoría</th>
                                <th>Precio Venta</th>
                                <th>Stock Actual</th>
                                <th>Stock Mín.</th>
                                <th>Visibilidad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosPaginados.map((prod) => (
                                <tr key={prod.id_producto}>
                                    <td data-label="Imagen">
                                        <ImagePreview
                                            src={prod.imagen}
                                            alt={prod.nombre}
                                            className={styles.ImagenProducto}
                                        />
                                    </td>
                                    <td data-label="Nombre">{prod.nombre}</td>
                                    <td data-label="Marca">{prod.marca?.nombre || "—"}</td>
                                    <td data-label="Categoría">{prod.marca?.categoria?.nombre || "—"}</td>
                                    <td data-label="Precio Venta">{formatPrice(prod.precio_venta)}</td>
                                    <td data-label="Stock">
                                        {prod.stock_actual === 0 ? (
                                            <button
                                                className={styles.tablaAccionesBtn}
                                                onClick={() => {
                                                    setProductoSeleccionado(prod);
                                                    setOpenCrear(true);
                                                }}
                                            >
                                                <i className="bx bx-plus-circle"></i>
                                            </button>
                                        ) : (
                                            <span style={{ fontWeight: "600", color: "var(--texto)" }}>
                                                {prod.stock_actual}
                                            </span>
                                        )}
                                    </td>
                                    <td data-label="Stock Mín.">{prod.stock_minimo}</td>
                                    <td data-label="Visibilidad">
                                        <div className={styles.visibilityToggle}>
                                            <button
                                                className={`${styles.toggleSwitch} ${prod.activo ? styles.active : ""}`}
                                                onClick={() => handleOpen(prod)}
                                                title={prod.activo ? "Desactivar" : "Activar"}
                                            />
                                            <span className={styles.toggleLabel}>
                                                {prod.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </td>
                                    <td data-label="Acciones">
                                        <div className={styles.acciones}>
                                            <button
                                                className={styles.tablaAccionesBtn}
                                                onClick={() => handleOpen(prod)}
                                            >
                                                <i className="bx bx-edit"></i>
                                                Editar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {open && (
                <ProductoForm
                    open={open}
                    onClose={handleClose}
                    onSubmit={handleGuardar}
                    modoEdicion={modoEdicion}
                    producto={productoSeleccionado}
                />
            )}

            {openCrear && (
                <ModalCrearStock
                    open={openCrear}
                    onClose={() => setOpenCrear(false)}
                    onSubmit={async (form) => {
                        try {
                            await crearInventario({
                                id_producto: productoSeleccionado.id_producto,
                                id_almacen: form.id_almacen,
                                stock: form.stock,
                            });
                            Swal.fire("Creado", "Stock creado correctamente", "success");
                            setOpenCrear(false);
                        } catch (err) {
                            Swal.fire("Error", err.message, "error");
                        }
                    }}
                    productos={[productoSeleccionado]}
                    almacenes={[
                        { id_almacen: 1, nombre_almacen: "Bodega" },
                        { id_almacen: 2, nombre_almacen: "Vitrinas" },
                    ]}
                />
            )}
        </main>
    );
}
