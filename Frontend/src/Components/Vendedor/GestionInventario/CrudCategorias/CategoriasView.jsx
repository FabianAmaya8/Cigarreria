import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import { Error, Loading } from "../../../../Utils/Cargando";
import useCrudCategorias from "../../../../Hooks/Vendedor/GestionInventario/useCrudCategorias";
import CategoriaForm from "./CrudCategorias";
import Filtro from "../Filtro";
import Paginacion from "../Paginacion";
import styles from "../../../../assets/Css/crud.module.scss";
import stylesFiltro from "../../../../assets/Css/deuda.module.scss";

export default function CategoriasView() {
    const { categorias, isLoadingCategorias, errorCategorias, crearCategoria, actualizarCategoria } =
        useCrudCategorias();

    const [open, setOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // 🔹 Filtrado
    const categoriasFiltradas = useMemo(() => {
        if (!categorias) return [];
        const termino = busqueda.toLowerCase();
        return categorias.filter(
            (c) =>
                c.nombre.toLowerCase().includes(termino) ||
                c.descripcion?.toLowerCase().includes(termino)
        );
    }, [categorias, busqueda]);

    // 🔹 Paginación
    const handleChangePage = (newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    // 🔹 Modal
    const handleOpen = (categoria = null) => {
        setModoEdicion(!!categoria);
        setCategoriaSeleccionada(categoria);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    // 🔹 Guardar categoría
    const handleGuardar = async (form) => {
        try {
            if (modoEdicion) {
                await actualizarCategoria({ id: categoriaSeleccionada.id_categoria, data: form });
                Swal.fire("Actualizado", "La categoría fue actualizada correctamente", "success");
            } else {
                await crearCategoria(form);
                Swal.fire("Creado", "La categoría fue creada correctamente", "success");
            }
            handleClose();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const categoriasPaginadas = categoriasFiltradas.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (isLoadingCategorias) return <Loading />;
    if (errorCategorias) return <Error msg={errorCategorias.message} />;

    return (
        <main className={`${styles.Contenedor} ${stylesFiltro.Container}`}>
            <h2>Gestión de Categorías</h2>

            {/* 🔸 Filtro */}
            <Filtro
                busqueda={busqueda}
                setBusqueda={setBusqueda}
            >
                <Paginacion
                    page={page}
                    rowsPerPage={rowsPerPage}
                    total={categoriasFiltradas.length}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Filtro>

            {/* 🔸 Tabla */}
            <section className={styles.TablaSection}>
                <div className={styles.Header}>
                    <button className="btn-primary" onClick={() => handleOpen()}>
                        + Nueva Categoría
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoriasPaginadas.map((c) => (
                            <tr key={c.id_categoria}>
                                <td>{c.id_categoria}</td>
                                <td>{c.nombre}</td>
                                <td>{c.descripcion}</td>
                                <td>
                                    <button
                                        className="btn-outline-primary"
                                        onClick={() => handleOpen(c)}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* 🔸 Modal */}
            {open && (
                <CategoriaForm
                    open={open}
                    onClose={handleClose}
                    onSubmit={handleGuardar}
                    modoEdicion={modoEdicion}
                    categoria={categoriaSeleccionada}
                />
            )}
        </main>
    );
}
