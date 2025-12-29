import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        try {
            return token ? jwtDecode(token) : null;
        } catch {
            return null;
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (!token) return false;
        try {
            const { exp } = jwtDecode(token);
            return Date.now() < exp * 1000;
        } catch {
            return false;
        }
    });

    const login = (newToken) => {
        try {
            const decoded = jwtDecode(newToken);
            setToken(newToken);
            setUser(decoded);
            localStorage.setItem("token", newToken);
            setIsAuthenticated(true);
        } catch (err) {
            console.error("Error decodificando token:", err);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        setIsAuthenticated(false);

        // limpiar cache despues de 2 segundos
        setTimeout(() => {
            sessionStorage.clear();
            queryClient.cancelQueries();
            queryClient.clear();
        }, 1000);
    };

    // Expiración automática
    useEffect(() => {
        if (!token) {
            setIsAuthenticated(false);
            return;
        }
        const interval = setInterval(() => {
            try {
                const { exp } = jwtDecode(token);
                if (Date.now() >= exp * 1000) {
                    Swal.fire({
                        title: "Sesión expirada",
                        text: "Vuelve a iniciar sesión.",
                        icon: "warning",
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#03624c",
                    });
                    logout();
                }
            } catch {
                logout();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
