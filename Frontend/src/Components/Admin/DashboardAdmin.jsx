import { useMemo, useState } from "react";
import {
    ShieldCheck,
    Users,
    UserCheck,
    UserX,
    Search,
    Mail,
    AtSign,
} from "lucide-react";
import { useUsuarios } from "../../Hooks/Vendedor/useUsuarios";
import styles from "../../assets/Css/Admin/DashboardAdmin.module.scss";
import ImagePreview from "../../Utils/Components/ImagePreview";

export default function DashboardAdmin() {
    const { data: usuarios = [], isLoading, error } = useUsuarios();
    const [busqueda, setBusqueda] = useState("");

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter((usuario) => {
            const texto = busqueda.toLowerCase();

            return (
                usuario.nombre.toLowerCase().includes(texto) ||
                usuario.usuario.toLowerCase().includes(texto) ||
                usuario.correo.toLowerCase().includes(texto)
            );
        });
    }, [usuarios, busqueda]);

    const totalUsuarios = usuarios.length;

    const activos = usuarios.filter(
        (usuario) => usuario.activo
    ).length;

    const inactivos = totalUsuarios - activos;

    const administradores = usuarios.filter(
        (usuario) => usuario.rol === 1
    ).length;

    const empleados = usuarios.filter(
        (usuario) => usuario.rol === 2
    ).length;

    const obtenerRol = (rol) => {
        switch (rol) {
            case 1:
                return "Administrador";
            case 2:
                return "Empleado";
            default:
                return "Usuario";
        }
    };

    if (isLoading) {
        return (
            <section className={styles.dashboard}>
                <div className="cargando">
                    <i className="bx bx-loader-alt bx-spin"></i>
                    <p>Cargando usuarios...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.dashboard}>
                <div className={styles.error}>
                    Error al cargar los usuarios.
                </div>
            </section>
        );
    }

    return (
        <main className={styles.dashboard}>
            <header className={styles.header}>
                <div>
                    <h1>Administración</h1>
                    <p>Gestiona los usuarios registrados en el sistema.</p>
                </div>
            </header>

            <section className={styles.stats}>
                <article className={styles.statCard}>
                    <Users size={28} />
                    <span>{totalUsuarios}</span>
                    <small>Total usuarios</small>
                </article>

                <article className={styles.statCard}>
                    <UserCheck size={28} />
                    <span>{activos}</span>
                    <small>Activos</small>
                </article>

                <article className={styles.statCard}>
                    <UserX size={28} />
                    <span>{empleados}</span>
                    <small>Empleados</small>
                </article>

                <article className={styles.statCard}>
                    <ShieldCheck size={28} />
                    <span>{administradores}</span>
                    <small>Administradores</small>
                </article>
            </section>

            <div className={styles.searchContainer}>
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <section className={styles.usersGrid}>
                {usuariosFiltrados.map((usuario) => (
                    <article
                        key={usuario.id_usuario}
                        className={styles.userCard}
                    >
                        <div className={styles.avatar}>
                            <ImagePreview
                                src={usuario.imagen}
                                alt={usuario.nombre}
                                fallback={<span>
                                    {usuario.nombre.charAt(0).toUpperCase()}
                                </span>}
                            />
                        </div>

                        <div className={styles.userInfo}>
                            <div className={styles.top}>
                                <h3>{usuario.nombre}</h3>

                                <span
                                    className={
                                        usuario.activo
                                            ? styles.activo
                                            : styles.inactivo
                                    }
                                >
                                    {usuario.activo
                                        ? "Activo"
                                        : "Inactivo"}
                                </span>
                            </div>

                            <p>
                                <AtSign size={15} />
                                {usuario.usuario}
                            </p>

                            <p>
                                <Mail size={15} />
                                {usuario.correo}
                            </p>

                            <span className={styles.rol}>
                                {obtenerRol(usuario.rol)}
                            </span>
                        </div>
                    </article>
                ))}

                {usuariosFiltrados.length === 0 && (
                    <div className={styles.empty}>
                        No se encontraron usuarios.
                    </div>
                )}
            </section>
        </main>
    );
}