import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "../../../Pages/Context/AuthContext";
import useInfoPersonal from "../../../Hooks/Client/useInfoPersonal";
import stylesPersonal from "../../../assets/Css/PerfilPersonal.module.scss";
import { Loading, Error } from "../../../Utils/Components/Cargando";

export default function Personal() {
    const { user } = useAuthContext();
    const {
        perfil,
        isLoadingPerfil,
        errorPerfil,
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
        nueva: "",
        confirmar: ""
    });

    const [showPassword, setShowPassword] = useState({
        actual: false,
        nueva: false,
        confirmar: false
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

    if (isLoadingPerfil) return <Loading />;
    if (errorPerfil)
        return <Error msg="Error al cargar el perfil" errorCode={errorPerfil} />;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleGuardar = async () => {
        await actualizarDatos(form);
    };

    const handlePassword = async () => {
        if (passwords.nueva !== passwords.confirmar) {
            alert("Las contraseñas no coinciden");
            return;
        }
        await cambiarPassword(passwords);
        setPasswords({ actual: "", nueva: "", confirmar: "" });
    };

    const handleImagen = async (e) => {
        const file = e.target.files[0];
        if (file) await actualizarImagen(file);
    };

    const toggleVisibility = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <motion.main
            className={stylesPersonal["perfil-container"]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                className={stylesPersonal.container}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className={stylesPersonal.title}>Mi Perfil</h2>

                {/* Imagen de perfil */}
                <section className={`${stylesPersonal["imagen-section"]} card`}>
                    {perfil?.imagen === null ? (
                        <i className="bx bx-user"></i>
                    ) : (
                        <motion.img
                            src={perfil?.imagen || "/default-user.png"}
                            alt="perfil"
                            className={stylesPersonal["imagen-perfil"]}
                            whileHover={{ scale: 1.05 }}
                        />
                    )}
                    <label
                        htmlFor="imagen"
                        className={`${stylesPersonal["btn-subir"]} btn btn-primary`}
                    >
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

                {/* Datos personales */}
                <section className={`${stylesPersonal.datos} card`}>
                    <h3>Información Personal</h3>

                    <div className={stylesPersonal.grupo}>
                        <label>Nombre</label>
                        <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className={stylesPersonal.grupo}>
                        <label>Correo</label>
                        <input
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div className={stylesPersonal.grupo}>
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

                {/* Cambio de contraseña */}
                <motion.section
                    className={`${stylesPersonal["password-section"]} card`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>Cambiar Contraseña</h3>

                    {/* Contraseña actual */}
                    <div className={stylesPersonal.grupo}>
                        <label>Contraseña actual</label>
                        <div className={stylesPersonal["input-password"]}>
                            <input
                                type={showPassword.actual ? "text" : "password"}
                                value={passwords.actual}
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        actual: e.target.value
                                    })
                                }
                                placeholder="Contraseña actual"
                            />
                            <i
                                className={`bx ${showPassword.actual ? "bx-show" : "bx-hide"}`}
                                onClick={() => toggleVisibility("actual")}
                            ></i>
                        </div>
                    </div>

                    {/* Nueva contraseña */}
                    <div className={stylesPersonal.grupo}>
                        <label>Nueva contraseña</label>
                        <div className={stylesPersonal["input-password"]}>
                            <input
                                type={showPassword.nueva ? "text" : "password"}
                                value={passwords.nueva}
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        nueva: e.target.value
                                    })
                                }
                                placeholder="Nueva contraseña"
                            />
                            <i
                                className={`bx ${showPassword.nueva ? "bx-show" : "bx-hide"}`}
                                onClick={() => toggleVisibility("nueva")}
                            ></i>
                        </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div className={stylesPersonal.grupo}>
                        <label>Confirmar contraseña</label>
                        <div className={stylesPersonal["input-password"]}>
                            <input
                                type={showPassword.confirmar ? "text" : "password"}
                                value={passwords.confirmar}
                                onChange={(e) =>
                                    setPasswords({
                                        ...passwords,
                                        confirmar: e.target.value
                                    })
                                }
                                placeholder="Confirmar nueva contraseña"
                            />
                            <i
                                className={`bx ${showPassword.confirmar ? "bx-show" : "bx-hide"}`}
                                onClick={() => toggleVisibility("confirmar")}
                            ></i>
                        </div>
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
