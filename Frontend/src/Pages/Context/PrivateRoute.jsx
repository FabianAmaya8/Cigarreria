import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const PrivateRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuthContext();

    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }

    if (user.rol === 1) {
        // Rol 1 puede ver todo
        if (requiredRole === 1 || requiredRole === 2 || requiredRole === 3) {
            return children;
        }
    } else if (user.rol === 2) {
        // Rol 2 puede ver lo de rol 2 y rol 3
        if (requiredRole === 2 || requiredRole === 3) {
            return children;
        }
        
    }else if (user.rol === 3) {
        // Rol 3 solo puede ver lo de rol 3
        if (requiredRole === 3) {
            return children;
        }
    }

    return <Navigate to="/" replace />;
};

export default PrivateRoute;
