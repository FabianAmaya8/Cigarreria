import styles from "../../../assets/Css/index.module.scss";

const Login = () => {
    return (
        <main className={styles.Container + " justify-content-center"}>
            <div className="card w-75 p-3">
                <h3 className="card-title text-center">Login</h3>
                <form>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            <i className='bx bx-user'></i> Email address
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            aria-describedby="emailHelp"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            <i className='bx bx-lock-alt'></i> Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default Login;
