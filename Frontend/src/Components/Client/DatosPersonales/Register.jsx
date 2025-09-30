import { useState } from "react";
import { useAuth } from "../../../Hooks/Client/useAuth";
import styles from "../../../assets/Css/index.module.scss";

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
        <main className={styles.Container + " justify-content-center"}>
            <div className="card w-75 p-3">
                <h3 className="card-title text-center">Register</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 mt-3">
                        <label htmlFor="imgProfileInput" className="form-label d-flex justify-content-center w-100" style={{cursor: 'pointer'}}>
                            {registerForm.fotoPreview ? (
                                <img
                                id="imagen"
                                src={registerForm.fotoPreview}
                                alt="Profile Picture"
                                className="rounded-circle border"
                                style={{width: '150px', height: '150px', objectFit: 'cover'}}
                                />
                            ) : (
                                <div className="d-flex flex-column text-center">
                                    <i className="bx bx-image-add fs-1"></i> 
                                    <p>Subir Foto</p>
                                </div>
                            )}
                        </label>
                        <input
                            type="file"
                            className="d-none"
                            id="imgProfileInput"
                            name="imagen"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">
                            <i className="bx bx-user"></i> Nombre y Apellido
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="nombre"
                            value={registerForm.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="usuario" className="form-label">
                            <i className="bx bx-id-card"></i> Usuario Visible
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="usuario"
                            value={registerForm.usuario}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="correo" className="form-label">
                            <i className="bx bx-envelope"></i> Correo
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="correo"
                            value={registerForm.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3 position-relative">
                        <label htmlFor="contrasena" className="form-label">
                            <i className="bx bx-lock-alt"></i> Contraseña
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="contrasena"
                            value={registerForm.contrasena}
                            onChange={handleChange}
                            required
                        />
                        <i 
                            className={`bx ${showPassword ? 'bxs-show' : 'bxs-hide'}`}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '38px',
                                cursor: 'pointer'
                            }}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>
                    <div className="mb-3 position-relative">
                        <label htmlFor="confirmPassword" className="form-label">
                            <i className="bx bx-lock-alt"></i> Confirmar Contraseña
                        </label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control"
                            id="confirmPassword"
                            value={registerForm.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <i 
                            className={`bx ${showConfirmPassword ? 'bxs-show' : 'bxs-hide'}`}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '38px',
                                cursor: 'pointer'
                            }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        ></i>
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Cargando..." : "Register"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default Register;