import { useState, useMemo } from "react";
import useInventario from "../../../../Hooks/Vendedor/GestionInventario/useInventario";
import Filtro from "../Filtro";
import ModalActualizarStock from "./ModalActualizarStock";
import ModalTransferirStock from "./ModalTransferirStock";
import Paginacion from "../Paginacion";
import styles from "../../../../assets/Css/crud.module.scss";
import stylesInicio from "../../../../assets/Css/Catalogo.module.scss";
import stylesFiltro from "../../../../assets/Css/deuda.module.scss";
import { Warehouse, ShoppingBasket } from "lucide-react";
import { Error, Loading } from "../../../../Utils/Cargando";
import { useAuthContext } from "../../../../Pages/Context/AuthContext";
import Swal from "sweetalert2";

export default function AlmacenesView() {
    const {user} = useAuthContext();
    const {
        inventario,
        isLoadingInventario,
        errorInventario,
        actualizarStock,
        transferirStock
    } = useInventario();

    const [busqueda, setBusqueda] = useState("");
    const [almacenFiltro, setAlmacenFiltro] = useState("");
    const [productoFiltro, setProductoFiltro] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openActualizar, setOpenActualizar] = useState(false);
    const [openTransferir, setOpenTransferir] = useState(false);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);

    const almacenes = useMemo(() => {
        const set = new Set(inventario.map((i) => i.nombre_almacen));
        return Array.from(set);
    }, [inventario]);

    const productos = useMemo(() => {
        const set = new Set(inventario.map((i) => i.nombre_producto));
        return Array.from(set);
    }, [inventario]);

    const inventarioFiltrado = useMemo(() => {
        if (!inventario) return [];
        let filtrados = inventario;

        if (busqueda) {
            const term = busqueda.toLowerCase();
            filtrados = filtrados.filter(
                (i) =>
                    i.nombre_almacen.toLowerCase().includes(term) ||
                    i.nombre_producto.toLowerCase().includes(term)
            );
        }

        if (almacenFiltro)
            filtrados = filtrados.filter((i) => i.nombre_almacen === almacenFiltro);
        if (productoFiltro)
            filtrados = filtrados.filter((i) => i.nombre_producto === productoFiltro);

        return filtrados;
    }, [inventario, busqueda, almacenFiltro, productoFiltro]);

    const inventarioAgrupado = useMemo(() => {
        if (!inventarioFiltrado.length) return [];

        const agrupado = inventarioFiltrado.reduce((acc, item) => {
            const existente = acc.find((p) => p.id_producto === item.id_producto);

            if (existente) {
                existente.almacenes.push({
                    id_almacen: item.id_almacen,
                    nombre_almacen: item.nombre_almacen,
                    stock: item.stock,
                    id_inventario: item.id_inventario,
                });
                existente.stock_total += item.stock;
            } else {
                acc.push({
                    id_producto: item.id_producto,
                    nombre_producto: item.nombre_producto,
                    imagen: item.imagen,
                    codigo_barras: item.codigo_barras,
                    almacenes: [
                        {
                            id_almacen: item.id_almacen,
                            nombre_almacen: item.nombre_almacen,
                            stock: item.stock,
                            id_inventario: item.id_inventario,
                        },
                    ],
                    stock_total: item.stock,
                });
            }

            return acc;
        }, []);

        return agrupado;
    }, [inventarioFiltrado]);

    const handleChangePage = (newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleActualizarStock = (item) => {
        setItemSeleccionado(item);
        setOpenActualizar(true);
    };

    const handleGuardarStock = async ({ id_inventario, stock }) => {
        try {
            await actualizarStock({
                id_inventario,
                data: { stock },
            });
            Swal.fire("Actualizado", "El stock fue actualizado correctamente", "success");
            setOpenActualizar(false);
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const handleTransferirStock = (item) => {
        setItemSeleccionado(item);
        setOpenTransferir(true);
    };

    const handleGuardarTransferencia = async (formData) => {
        try {
            await transferirStock({
                id_producto: itemSeleccionado.id_producto,
                id_almacen_origen: formData.id_almacen_origen,
                id_almacen_destino: formData.id_almacen_destino,
                cantidad: parseInt(formData.cantidad),
            });
            setOpenTransferir(false);
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoadingInventario) return <Loading />;
    if (errorInventario) return <Error msg={errorInventario.message} />;

    return (
        <main className={`${styles.Contenedor} ${stylesFiltro.Container}`}>
            <h2>Gestión de Inventario</h2>

            <Filtro
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                categoria={almacenFiltro}
                setCategoria={setAlmacenFiltro}
                categorias={almacenes}
                mostrarBusqueda={true}
                mostrarCategoria={true}
            >
                <Paginacion
                    page={page}
                    rowsPerPage={rowsPerPage}
                    total={inventarioAgrupado.length}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Filtro>

            <section className={stylesInicio.cartProducto}>
                {inventarioAgrupado
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => {
                        return <div className={stylesInicio.cartProductoItem} key={item.id_producto}>
                            <div className={stylesInicio.ImagenProducto}>
                                {item.imagen ? (
                                    <img src={item.imagen} alt={item.nombre_producto} loading="lazy"/>
                                ) : (
                                    <i className="bx bx-image"></i>
                                )}
                            </div>

                            <h3>{item.nombre_producto}</h3>

                            <p><b>Codigo</b> {item.codigo_barras}</p>

                            {item.almacenes.map((a) => (
                                <div key={a.id_almacen} className={stylesInicio.InfoProducto}>
                                    {a.id_almacen === 1 ? (
                                        <Warehouse size={40} color="var(--azul-500)" />
                                    ) : (
                                        <ShoppingBasket size={40} color="var(--azul-500)" />
                                    )}
                                    <p>
                                        <b>{a.nombre_almacen}</b> {a.stock}
                                    </p>
                                </div>
                            ))}

                            <p>
                                <b>Stock Total</b> {item.stock_total}
                            </p>

                            <div className={stylesInicio.BotonesProducto + " btn-group"}>
                                {user.rol === 1 ? 
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => handleActualizarStock(item)}
                                    >
                                        Actualizar
                                    </button>
                                :null}
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => handleTransferirStock(item)}
                                >
                                    Transferir
                                </button>
                            </div>
                        </div>;
                    })}
            </section>

            {openActualizar && (
                <ModalActualizarStock
                    open={openActualizar}
                    onClose={() => setOpenActualizar(false)}
                    item={itemSeleccionado}
                    onSubmit={handleGuardarStock}
                />
            )}

            {openTransferir && (
                <ModalTransferirStock
                    open={openTransferir}
                    onClose={() => setOpenTransferir(false)}
                    item={itemSeleccionado}
                    onSubmit={handleGuardarTransferencia}
                />
            )}
        </main>
    );
}
