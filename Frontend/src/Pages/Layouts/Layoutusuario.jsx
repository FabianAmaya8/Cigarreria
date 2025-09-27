import { Outlet } from 'react-router-dom';
import Header from '../../Components/Client/Fijos/Header';
import Footer from '../../Components/Client/Fijos/Footer';

export default function Layoutusuario() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
}