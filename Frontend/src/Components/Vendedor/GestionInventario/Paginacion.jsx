import styles from "../../../assets/Css/Dependencias/Paginacion.module.scss";

export default function Paginacion({
    page,
    rowsPerPage,
    total,
    handleChangePage,
    handleChangeRowsPerPage,
}) {
    const totalPages = Math.ceil(total / rowsPerPage);
    const isFirstPage = page === 0;
    const isLastPage = (page + 1) * rowsPerPage >= total;

    return (
        <div className={styles.Paginacion}>
            <h6>Paginación</h6>
            
            <div className={styles.PaginacionBotones}>
                <button
                    className="btn-secondary"
                    disabled={page === 0}
                    onClick={() => handleChangePage(page - 1)}
                    title="Página anterior"
                    aria-label="Ir a página anterior"
                >
                    <i className="bx bxs-chevrons-left"></i>
                </button>

                <span aria-live="polite" aria-atomic="true">
                    {page + 1} / {Math.ceil(total / rowsPerPage)}
                </span>

                <button
                    className="btn-secondary"
                    disabled={(page + 1) * rowsPerPage >= total}
                    onClick={() => handleChangePage(page + 1)}
                    title="Página siguiente"
                    aria-label="Ir a página siguiente"
                >
                    <i className="bx bxs-chevrons-right"></i>
                </button>
            </div>

            <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                aria-label="Filas por página"
            >
                {[5, 10, 15, 20, 25].map((n) => (
                    <option key={n} value={n}>
                        {n} por página
                    </option>
                ))}
            </select>
        </div>
    );
}