import { useState } from "react";
import { useAuth } from "../../../Hooks/Client/useAuth";
import styles from "../../../assets/Css/Principales/Auth.module.scss";

const Register = () => {
    const { 
        register, 
        loading, 
        error,
        registerForm,
        handleChange,
        handleFileChange 
    } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register();
            // Optionally, redirect or clear form on success
        } catch (err) {
            // Error is already handled and shown by the hook
            console.error(err);
        }
    };

    return (
        <main className={styles.authMain}>
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <h1 className={styles.authTitle}>Registro</h1>

                    {error && (
                        <div className={styles.errorAlert}>
                            <i className="bx bx-exclamation-circle"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.profileUploadGroup}>
                            <label htmlFor="imgProfileInput" className={styles.profileUploadLabel}>
                                {registerForm.fotoPreview ? (
                                    <img
                                        src={registerForm.fotoPreview}
                                        alt="Foto de perfil"
                                        className={styles.profileImage}
                                    />
                                ) : (
                                    <div className={styles.profilePlaceholder}>
                                        <i className="bx bx-image-add"></i>
                                        <p>Subir Foto</p>
                                    </div>
                                )}
                            </label>
                            <input
                                type="file"
                                id="imgProfileInput"
                                className={styles.profileFileInput}
                                name="imagen"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="nombre" className={styles.formLabel}>
                                <i className="bx bx-user"></i>
                                Nombre y Apellido
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                className={styles.formInput}
                                placeholder="Tu nombre completo"
                                value={registerForm.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="usuario" className={styles.formLabel}>
                                <i className="bx bx-id-card"></i>
                                Usuario Visible
                            </label>
                            <input
                                type="text"
                                id="usuario"
                                className={styles.formInput}
                                placeholder="Tu nombre de usuario"
                                value={registerForm.usuario}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="correo" className={styles.formLabel}>
                                <i className="bx bx-envelope"></i>
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="correo"
                                className={styles.formInput}
                                placeholder="Tu correo electrónico"
                                value={registerForm.correo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="contrasena" className={styles.formLabel}>
                                <i className="bx bx-lock-alt"></i>
                                Contraseña
                            </label>
                            <div className={styles.inputGroup}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="contrasena"
                                    className={styles.formInputPassword}
                                    placeholder="Crea una contraseña segura"
                                    value={registerForm.contrasena}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.togglePasswordBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <i className={`bx ${showPassword ? "bxs-hide" : "bxs-show"}`}></i>
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword" className={styles.formLabel}>
                                <i className="bx bx-lock-alt"></i>
                                Confirmar Contraseña
                            </label>
                            <div className={styles.inputGroup}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className={styles.formInputPassword}
                                    placeholder="Repite tu contraseña"
                                    value={registerForm.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.togglePasswordBtn}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <i className={`bx ${showConfirmPassword ? "bxs-hide" : "bxs-show"}`}></i>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="bx bx-loader-alt bx-spin"></i>
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    <i className="bx bx-user-plus"></i>
                                    Crear Cuenta
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default Register;