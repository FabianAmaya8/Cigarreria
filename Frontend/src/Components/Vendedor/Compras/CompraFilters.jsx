export default function CompraFilters({
    busqueda, setBusqueda,
    idProveedor, setIdProveedor,
    estadoPago, setEstadoPago,
    estadoRecepcion, setEstadoRecepcion,
    proveedores = [], styles,
}) {
    return (
        <section className={styles.toolbar}>
            <label className={styles.field}>
                <span className={styles.fieldLabel}>Buscar</span>
                <input className={styles.fieldInput} type="search"
                    placeholder="Factura, proveedor o ID"
                    value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
            </label>
            <label className={styles.field}>
                <span className={styles.fieldLabel}>Proveedor</span>
                <select className={styles.fieldSelect} value={idProveedor}
                    onChange={(event) => setIdProveedor(event.target.value)}>
                    <option value="">Todos</option>
                    {proveedores.map((proveedor) => (
                        <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                            {proveedor.nombre}
                        </option>
                    ))}
                </select>
            </label>
            <label className={styles.field}>
                <span className={styles.fieldLabel}>Pago</span>
                <select className={styles.fieldSelect} value={estadoPago}
                    onChange={(event) => setEstadoPago(event.target.value)}>
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="parcial">Parcial</option>
                    <option value="pagada">Pagada</option>
                </select>
            </label>
            <label className={styles.field}>
                <span className={styles.fieldLabel}>Recepción</span>
                <select className={styles.fieldSelect} value={estadoRecepcion}
                    onChange={(event) => setEstadoRecepcion(event.target.value)}>
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="parcial">Parcial</option>
                    <option value="completa">Completa</option>
                </select>
            </label>
        </section>
    );
}
