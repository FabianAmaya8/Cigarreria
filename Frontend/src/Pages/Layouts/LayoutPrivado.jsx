import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import PrivateRoute from "../Context/PrivateRoute";
import Header from '../../Components/Client/Fijos/Header';
import Footer from '../../Components/Client/Fijos/Footer';
import { Outlet } from "react-router-dom";
import "../../assets/Css/Transiciones.scss";
import { BtnVolver } from "../../Utils/Cargando";

export default function LayoutPrivado({ requiredRole }) {
    const location = useLocation();
    return (
        <PrivateRoute requiredRole={requiredRole} >
            <Header />
            <BtnVolver/>
            <Outlet key={location.pathname} />

            {/* Capa flotante que anima cada cambio de ruta */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    className="transition-overlay"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                />
            </AnimatePresence>
            <Footer />
        </PrivateRoute>
    )
}
