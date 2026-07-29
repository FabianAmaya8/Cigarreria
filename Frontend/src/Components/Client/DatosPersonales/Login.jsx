import { useState } from "react";
import { useAuth } from "../../../Hooks/Client/useAuth";
import styles from "../../../assets/Css/Principales/Auth.module.scss";

const Login = () => {
    const { login, loading, error, loginForm, handleLoginChange } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(loginForm.identifier, loginForm.password);
        } catch {}
    };

    return (
        <main className={styles.authMain}>
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <h1 className={styles.authTitle}>Login</h1>

                    {error && (
                        <div className={styles.errorAlert}>
                            <i className="bx bx-exclamation-circle"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="identifier" className={styles.formLabel}>
                                <i className="bx bx-user"></i>
                                Usuario o Correo
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                className={styles.formInput}
                                placeholder="Tu usuario o correo electrónico"
                                value={loginForm.identifier}
                                onChange={handleLoginChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.formLabel}>
                                <i className="bx bx-lock-alt"></i>
                                Contraseña
                            </label>
                            <div className={styles.inputGroup}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className={styles.formInputPassword}
                                    placeholder="Tu contraseña"
                                    value={loginForm.password}
                                    onChange={handleLoginChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.togglePasswordBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <i className={`bx ${showPassword ? "bx-hide" : "bx-show"}`}></i>
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
                                    <i className="bx bx-log-in"></i>
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};


export default Login;
