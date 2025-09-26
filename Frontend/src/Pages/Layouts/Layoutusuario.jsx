import { Outlet } from 'react-router-dom';
import Header from '../../Components/User/Fijos/Header';
import Footer from '../../Components/User/Fijos/Footer';

export default function Layoutusuario() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
}