import { useAuth } from "../../../Hooks/useAuth";
import styles from "../../../assets/Css/index.module.scss";

const Login = () => {
    const { login, loading, error, loginForm, handleLoginChange } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(loginForm.identifier, loginForm.password);
        } catch {}
    };

    return (
        <main className={styles.Container + " justify-content-center"}>
            <div className="card w-75 p-3">
                <h3 className="card-title text-center">Login</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="identifier" className="form-label">
                            <i className="bx bx-user"></i> Usuario o Correo
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="identifier"
                            value={loginForm.identifier}
                            onChange={handleLoginChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            <i className="bx bx-lock-alt"></i> Contraseña
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={loginForm.password}
                            onChange={handleLoginChange}
                            required
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Cargando..." : "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default Login;
