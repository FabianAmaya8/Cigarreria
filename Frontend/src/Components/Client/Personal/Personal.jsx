import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Hourglass } from "ldrs/react";
import { useAuthContext } from "../../../Pages/Context/AuthContext";
import useInfoPersonal from "../../../Hooks/Client/useInfoPersonal";
import styles from "../../../assets/Css/index.module.scss";
import stylesPersonal from "../../../assets/Css/PerfilPersonal.module.scss";

export default function Personal() {
    const { user } = useAuthContext();
    const {
        perfil,
        isLoadingPerfil,
        actualizarDatos,
        cambiarPassword,
        actualizarImagen,
        isActualizando,
        isCambiandoPassword,
        isSubiendoImagen
    } = useInfoPersonal(user.id);

    const [form, setForm] = useState({
        nombre: "",
        correo: "",
        usuario: ""
    });
    const [passwords, setPasswords] = useState({
        actual: "",
        nueva: ""
    });

    useEffect(() => {
        if (perfil) {
            setForm({
                nombre: perfil.nombre || "",
                correo: perfil.correo || "",
                usuario: perfil.usuario || ""
            });
        }
    }, [perfil]);

    if (isLoadingPerfil) {
        return (
            <div className="cargando">
                <Hourglass size="150" color="var(--rojo-500)" />
            </div>
        );
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGuardar = async () => {
        await actualizarDatos(form);
    };

    const handlePassword = async () => {
        await cambiarPassword(passwords);
        setPasswords({ actual: "", nueva: "" });
    };

    const handleImagen = async (e) => {
        const file = e.target.files[0];
        if (file) await actualizarImagen(file);
    };

    return (
        <motion.main
            className={stylesPersonal.PerfilContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                className={`${styles.Container}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className={stylesPersonal.Title}>Mi Perfil</h2>

                <section className={stylesPersonal.ImagenSection + " card"}>
                    {perfil?.imagen === null ?
                        (
                            <i className="bx bx-user"></i>
                        ):
                        (<motion.img
                            src={perfil?.imagen || "/default-user.png"}
                            alt="perfil"
                            className={stylesPersonal.ImagenPerfil}
                            whileHover={{ scale: 1.05 }}
                        />)
                    }
                        <label htmlFor="imagen" className={ stylesPersonal.BtnSubir + " btn btn-primary"}>
                        Cambiar imagen
                        <input
                            id="imagen"
                            type="file"
                            accept="image/*"
                            onChange={handleImagen}
                            disabled={isSubiendoImagen}
                        />
                    </label>
                </section>

                <section className={stylesPersonal.Datos + " card"}>
                    <h3>Información Personal</h3>
                    <div className={stylesPersonal.Grupo}>
                        <label>Nombre</label>
                        <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div className={stylesPersonal.Grupo}>
                        <label>Correo</label>
                        <input
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                    <div className={stylesPersonal.Grupo}>
                        <label>Usuario</label>
                        <input
                            name="usuario"
                            value={form.usuario}
                            onChange={handleChange}
                            placeholder="Usuario"
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleGuardar}
                        disabled={isActualizando}
                    >
                        {isActualizando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </section>

                <motion.section
                    className={stylesPersonal.PasswordSection + " card"}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>Cambiar Contraseña</h3>
                    <div className={stylesPersonal.Grupo}>
                        <label>Contraseña actual</label>
                        <input
                            type="password"
                            value={passwords.actual}
                            onChange={(e) =>
                                setPasswords({
                                    ...passwords,
                                    actual: e.target.value
                                })
                            }
                        />
                    </div>
                    <div className={stylesPersonal.Grupo}>
                        <label>Nueva contraseña</label>
                        <input
                            type="password"
                            value={passwords.nueva}
                            onChange={(e) =>
                                setPasswords({
                                    ...passwords,
                                    nueva: e.target.value
                                })
                            }
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handlePassword}
                        disabled={isCambiandoPassword}
                    >
                        {isCambiandoPassword ? "Actualizando..." : "Cambiar contraseña"}
                    </button>
                </motion.section>
            </motion.div>
        </motion.main>
    );
}
