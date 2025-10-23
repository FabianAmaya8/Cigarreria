import styles from "../../../assets/Css/crud.module.scss";

export default function Paginacion({
    page,
    rowsPerPage,
    total,
    handleChangePage,
    handleChangeRowsPerPage,
}) {
    return (
        <div className={styles.Paginacion}>
            <h6>Paginación</h6>
            <div className={styles.PaginacionBotones}>
                <button
                    className="btn-secondary"
                    disabled={page === 0}
                    onClick={() => handleChangePage(page - 1)}
                >
                    <i className="bx bxs-chevrons-left"></i>
                </button>
                <span> {page + 1} / {Math.ceil(total / rowsPerPage)}</span>
                <button
                    className="btn-secondary"
                    disabled={(page + 1) * rowsPerPage >= total}
                    onClick={() => handleChangePage(page + 1)}
                >
                    <i className="bx bxs-chevrons-right"></i>
                </button>
            </div>
            <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="form-control"
            >
                {[5, 10, 25].map((n) => (
                    <option key={n} value={n}>{n} por página</option>
                ))}
            </select>
        </div>
    );
}
