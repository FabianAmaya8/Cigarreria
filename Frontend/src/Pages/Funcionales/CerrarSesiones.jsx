import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../Context/AuthContext";

export default function CerrarSesion() {
    const { logout } = useAuthContext();

    useEffect(() => {
        logout();
    }, [logout]);

    return <Navigate to="/" replace />;
}
