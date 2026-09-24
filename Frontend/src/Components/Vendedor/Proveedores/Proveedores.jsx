import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { Loading, Error } from "../../../Utils/Components/Cargando";
import {
    useActualizarProveedor,
    useCrearProveedor,
    useHistorialPreciosProveedor,
    useComprasProveedor,
    useProveedor,
    useProductosRelacionadosProveedor,
    useProveedores,
} from "../../../Hooks/Vendedor/Proveedores/useProveedores";
import styles from "../../../assets/Css/Vendedor/ComprasProveedores.module.scss";
import ProveedorModal from "./ProveedorModal";
import ProveedorDetalleModal from "./ProveedorDetalleModal";

function formatMoney(value) {
    const numeric = Number(value || 0);
    return `$ ${numeric.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function getProveedorResumen(proveedor) {
    return (
        proveedor?.nit ||
        proveedor?.telefono ||
        proveedor?.correo ||
        "Sin datos de contacto"
    );
}

export default function Proveedores() {
    const [buscar, setBuscar] = useState("");
    const [activo, setActivo] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [proveedorEditar, setProveedorEditar] = useState(null);
    const [proveedorDetalleId, setProveedorDetalleId] = useState(null);

    const filtros = useMemo(
        () => ({
            buscar,
            activo: activo === "" ? undefined : activo === "true",
        }),
        [buscar, activo],
    );

    const { data: proveedores, isLoading, error } = useProveedores(filtros);
    const crearProveedor = useCrearProveedor();
    const actualizarProveedor = useActualizarProveedor();

    const proveedorDetalleQuery = useProveedor(
        proveedorDetalleId,
        Boolean(proveedorDetalleId),
    );
    const productosRelacionadosQuery = useProductosRelacionadosProveedor(
        proveedorDetalleId,
        Boolean(proveedorDetalleId),
    );
    const comprasProveedorQuery = useComprasProveedor(
        proveedorDetalleId,
        Boolean(proveedorDetalleId),
    );
    const historialProveedorQuery = useHistorialPreciosProveedor(
        proveedorDetalleId,
        Boolean(proveedorDetalleId),
    );

    const proveedorDetalle =
        proveedorDetalleQuery.data ||
        proveedores?.find((item) => item.id_proveedor === proveedorDetalleId) ||
        null;

    const stats = useMemo(() => {
        const lista = Array.isArray(proveedores) ? proveedores : [];
        const activos = lista.filter((item) => item.activo).length;
        const inactivos = lista.length - activos;
        const yo = lista.find(
            (item) => item.nombre?.trim()?.toUpperCase() === "YO",
        );
        return {
            total: lista.length,
            activos,
            inactivos,
            yo: yo || null,
        };
    }, [proveedores]);

    async function handleGuardar(data) {
        if (proveedorEditar?.id_proveedor) {
            await actualizarProveedor.mutateAsync({
                idProveedor: proveedorEditar.id_proveedor,
                data,
            });
            Swal.fire(
                "Proveedor actualizado",
                "Los cambios se guardaron correctamente.",
                "success",
            );
        } else {
            await crearProveedor.mutateAsync(data);
            Swal.fire(
                "Proveedor creado",
                "El proveedor fue registrado correctamente.",
                "success",
            );
        }
        setOpenForm(false);
        setProveedorEditar(null);
    }

    function abrirNuevo() {
        setProveedorEditar(null);
        setOpenForm(true);
    }

    function abrirEdicion(proveedor) {
        setProveedorEditar(proveedor);
        setOpenForm(true);
    }

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <Error
                msg={error.message || "No se pudieron cargar los proveedores"}
            />
        );
    }

    return (
        <main className={styles.pageShell}>
            <section className={styles.hero}>
                <div className={styles.heroTitle}>
                    <span className={styles.kicker}>Compras y proveedores</span>
                    <h2>Gestión de Proveedores</h2>
                    <p>
                        Controla tus proveedores, su historial de compras, los
                        productos relacionados y el proveedor interno{" "}
                        <strong>YO</strong>.
                    </p>
                </div>
                <div className={styles.heroActions}>
                    <button
                        type="button"
                        className={`${styles.button} ${styles.buttonPrimary}`}
                        onClick={abrirNuevo}
                    >
                        <i className="bx bx-plus" />
                        Nuevo proveedor
                    </button>
                </div>
            </section>

            <section className={styles.toolbar}>
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Buscar</span>
                    <input
                        className={styles.fieldInput}
                        type="search"
                        placeholder="Nombre, NIT, teléfono o correo"
                        value={buscar}
                        onChange={(event) => setBuscar(event.target.value)}
                    />
                </label>
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Estado</span>
                    <select
                        className={styles.fieldSelect}
                        value={activo}
                        onChange={(event) => setActivo(event.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </label>
                <article className={styles.statCard}>
                    <span>Total</span>
                    <strong>{stats.total}</strong>
                </article>
                <article className={styles.statCard}>
                    <span>Activos</span>
                    <strong>{stats.activos}</strong>
                </article>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3>Listado de proveedores</h3>
                        <p>
                            Selecciona un proveedor para ver sus compras,
                            productos relacionados e historial de precios.
                        </p>
                    </div>
                    <span className={`${styles.badge} ${styles.badgeInfo}`}>
                        {Array.isArray(proveedores) ? proveedores.length : 0}{" "}
                        registros
                    </span>
                </div>

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Proveedor</th>
                                <th>Contacto</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(proveedores || []).map((proveedor) => (
                                <tr key={proveedor.id_proveedor}>
                                    <td data-label="Proveedor">
                                        <div className={styles.stack}>
                                            <strong>{proveedor.nombre}</strong>
                                            <span className={styles.muted}>
                                                {getProveedorResumen(proveedor)}
                                            </span>
                                            {proveedor.nombre
                                                ?.trim()
                                                ?.toUpperCase() === "YO" ? (
                                                <span
                                                    className={`${styles.badge} ${styles.badgeYo}`}
                                                >
                                                    Proveedor interno
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td data-label="Contacto">
                                        <div className={styles.cardMeta}>
                                            <span>
                                                {proveedor.telefono ||
                                                    "Sin teléfono"}
                                            </span>
                                            <span>
                                                {proveedor.correo ||
                                                    "Sin correo"}
                                            </span>
                                        </div>
                                    </td>
                                    <td data-label="Ubicación">
                                        <div className={styles.cardMeta}>
                                            <span>
                                                {proveedor.ciudad ||
                                                    "Sin ciudad"}
                                            </span>
                                            <span>
                                                {proveedor.pais || "Sin país"}
                                            </span>
                                        </div>
                                    </td>
                                    <td data-label="Estado">
                                        <span
                                            className={`${styles.badge} ${proveedor.activo ? styles.badgeActive : styles.badgeInactive}`}
                                        >
                                            {proveedor.activo
                                                ? "Activo"
                                                : "Inactivo"}
                                        </span>
                                    </td>
                                    <td data-label="Acciones">
                                        <div className={styles.inlineActions}>
                                            <button
                                                type="button"
                                                className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
                                                onClick={() =>
                                                    setProveedorDetalleId(
                                                        proveedor.id_proveedor,
                                                    )
                                                }
                                            >
                                                Ver
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.button} ${styles.buttonGhost} ${styles.buttonSmall}`}
                                                onClick={() =>
                                                    abrirEdicion(proveedor)
                                                }
                                            >
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

            <section className={styles.statGrid}>
                <article className={styles.statCard}>
                    <span>Inactivos</span>
                    <strong>{stats.inactivos}</strong>
                </article>
                <article className={styles.statCard}>
                    <span>Proveedor YO</span>
                    <strong>{stats.yo ? "Sí" : "No"}</strong>
                </article>
                <article className={styles.statCard}>
                    <span>Filtro actual</span>
                    <strong>{activo || "Todos"}</strong>
                </article>
                <article className={styles.statCard}>
                    <span>Ruta rápida</span>
                    <strong>Compras / Proveedores</strong>
                </article>
            </section>

            <ProveedorModal
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setProveedorEditar(null);
                }}
                initialData={proveedorEditar}
                isSubmitting={
                    crearProveedor.isPending || actualizarProveedor.isPending
                }
                onSubmit={handleGuardar}
            />

            <ProveedorDetalleModal
                open={Boolean(proveedorDetalleId)}
                onClose={() => setProveedorDetalleId(null)}
                proveedor={proveedorDetalle}
                productos={productosRelacionadosQuery.data || []}
                compras={comprasProveedorQuery.data || []}
                historial={historialProveedorQuery.data || []}
            />
        </main>
    );
}
