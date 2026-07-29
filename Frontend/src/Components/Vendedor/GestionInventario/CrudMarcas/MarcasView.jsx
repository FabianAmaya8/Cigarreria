import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { Error, Loading } from "../../../../Utils/Components/Cargando";
import useCrudCategorias from "../../../../Hooks/Vendedor/GestionInventario/useCrudCategorias";
import MarcaForm from "./CrudMarcas";
import Filtro from "../Filtro";
import Paginacion from "../Paginacion";
import styles from "../../../../assets/Css/crud.module.scss";

export default function MarcasView() {
    const { marcas, categorias, isLoadingMarcas, errorMarcas, crearMarca, actualizarMarca } = useCrudCategorias();

    const [open, setOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
    const [categoria, setCategoria] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // 🔹 Filtrar marcas
    const marcasFiltradas = useMemo(() => {
        if (!marcas) return [];
        let filtradas = marcas.filter((m) => {
            const coincideCategoria = categoria ? m.categoria?.nombre === categoria : true;
            const termino = busqueda.toLowerCase();
            const coincideBusqueda =
                !termino ||
                m.nombre.toLowerCase().includes(termino) ||
                m.categoria?.nombre.toLowerCase().includes(termino);

            return coincideCategoria && coincideBusqueda;
        });
        return filtradas;
    }, [marcas, categoria, busqueda]);

    // 🔹 Paginación
    const handleChangePage = (newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    // 🔹 Modal
    const handleOpen = (marca = null) => {
        setModoEdicion(!!marca);
        setMarcaSeleccionada(marca);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    // 🔹 Guardar marca
    const handleGuardar = async (form) => {
        try {
            if (modoEdicion) {
                await actualizarMarca({ id: marcaSeleccionada.id_marca, data: form });
                Swal.fire("Actualizado", "La marca fue actualizada correctamente", "success");
            } else {
                await crearMarca(form);
                Swal.fire("Creado", "La marca fue creada correctamente", "success");
            }
            handleClose();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const marcasPaginadas = marcasFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (isLoadingMarcas) return <Loading />;
    if (errorMarcas) return <Error msg={errorMarcas.message} />;

    // 🔹 Categorías únicas para filtro
    const categoriasUnicas = categorias.map((c) => c.nombre);

    return (
        <main className={styles.Contenedor}>
            <h2>Gestión de Marcas</h2>

            <Filtro
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                categoria={categoria}
                setCategoria={setCategoria}
                categorias={categoriasUnicas}
                mostrarBusqueda={true}
                mostrarCategoria={true}
            >
                <Paginacion
                    page={page}
                    rowsPerPage={rowsPerPage}
                    total={marcasFiltradas.length}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Filtro>

            <section className={styles.TablaSection}>
                <div className={styles.Header}>
                    <button onClick={() => handleOpen()}>
                        <i className="bx bx-plus"></i>
                        Nueva Marca
                    </button>
                </div>

                <div className={styles.tablaWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marcasPaginadas.map((m) => (
                                <tr key={m.id_marca}>
                                    <td data-label="Nombre">{m.nombre}</td>
                                    <td data-label="Categoría">{m.categoria?.nombre || "—"}</td>
                                    <td data-label="Acciones">
                                        <div className={styles.acciones}>
                                            <button
                                                className={styles.tablaAccionesBtn}
                                                onClick={() => handleOpen(m)}
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
                <MarcaForm
                    open={open}
                    onClose={handleClose}
                    onSubmit={handleGuardar}
                    modoEdicion={modoEdicion}
                    marca={marcaSeleccionada}
                />
            )}
        </main>
    );
}
