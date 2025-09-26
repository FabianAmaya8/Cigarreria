import { useState } from "react";
import { urlDB } from "../urlDB";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../Pages/Context/AuthContext";

export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const { login: loginContext, logout: logoutContext, token, user } = useAuthContext();

    const [loginForm, setLoginForm] = useState({
        identifier: "",
        password: "",
    });

    const [registerForm, setRegisterForm] = useState({
        nombre: "",
        usuario: "",
        correo: "",
        contrasena: "",
        confirmPassword: "",
        imagen: null,
        fotoPreview: null,
    });

    const handleLoginChange = (e) => {
        const { id, value } = e.target;
        setLoginForm((prev) => ({ ...prev, [id]: value }));
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setRegisterForm((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            Swal.fire({
                icon: "error",
                title: "Archivo no válido",
                text: "Solo se permiten imágenes (JPG, PNG, etc).",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: "error",
                title: "Imagen demasiado grande",
                text: "La imagen no puede superar los 5MB.",
            });
            return;
        }

        setRegisterForm((prev) => ({
            ...prev,
            imagen: file,
            fotoPreview: URL.createObjectURL(file),
        }));
    };

    // --- LOGIN ---
    const login = async (identifier, password) => {
        setLoading(true);
        setError(null);
        try {
            const url = await urlDB("/login");

            const body = new URLSearchParams();
            body.append("username", identifier);
            body.append("password", password);

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Error en login");
            }

            const data = await res.json();

            loginContext(data.access_token);

            Swal.fire({
                icon: "success",
                title: "Login Exitoso",
                showConfirmButton: false,
                timer: 1200,
            });

            if (data.redirect) {
                navigate(data.redirect);
            }

            return data;
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: "error",
                title: "Error en login",
                text: err.message,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // --- REGISTER ---
    const register = async () => {
        setLoading(true);
        setError(null);

        if (registerForm.contrasena !== registerForm.confirmPassword) {
            const error = "Las contraseñas no coinciden";
            setError(error);
            Swal.fire({
                icon: "error",
                title: "Error de validación",
                text: error,
            });
            setLoading(false);
            throw new Error(error);
        }

        try {
            const url = await urlDB("/register");

            const formData = new FormData();
            formData.append("nombre", registerForm.nombre);
            formData.append("usuario", registerForm.usuario);
            formData.append("correo", registerForm.correo);
            formData.append("contrasena", registerForm.contrasena);
            if (registerForm.imagen) {
                formData.append("imagen", registerForm.imagen);
            }

            const res = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Error en registro");
            }

            Swal.fire({
                icon: "success",
                title: "Registro Exitoso",
                text: "Ahora puedes iniciar sesión.",
            });

            return await res.json();
        } catch (err) {
            setError(err.message);
            Swal.fire({
                icon: "error",
                title: "Error en el registro",
                text: err.message,
            });
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        register,
        token,
        user,
        loading,
        error,
        loginForm,
        handleLoginChange,
        registerForm,
        handleChange,
        handleFileChange,
    };
}
