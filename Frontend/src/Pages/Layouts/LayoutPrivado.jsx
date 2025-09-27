import PrivateRoute from "../Context/PrivateRoute";
import Header from '../../Components/Client/Fijos/Header';
import Footer from '../../Components/Client/Fijos/Footer';
import { Outlet } from "react-router-dom";

export default function LayoutPrivado({ requiredRole }) {
    return (
        <PrivateRoute requiredRole={requiredRole} >
            <Header />
            <Outlet />
            <Footer />
        </PrivateRoute>
    )
}
