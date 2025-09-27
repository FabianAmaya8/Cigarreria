import { createBrowserRouter } from "react-router-dom";

//Layouts
import Layoutusuario from "./Pages/Layouts/Layoutusuario";
import LayoutPrivado from "./Pages/Layouts/LayoutPrivado";

//Funcionales
import CerrarSesion from "./Pages/Funcionales/CerrarSesiones";
import Error404 from "./Pages/Funcionales/Error404";

//Paginas
import Login from "./Components/Client/DatosPersonales/Login";
import Register from "./Components/Client/DatosPersonales/Register";
import Inicio from "./Components/Client/Inicio";
import Estadisticas from "./Components/Vendedor/Estadisticas";

const router = createBrowserRouter([
    {
        element: <Layoutusuario />,
        children: [
            { path: "/", element: <Inicio />, },
            { path: "*", element: <Error404 />, },
            { path: "/logout", element: <CerrarSesion />, },
            { path: "/login", element: <Login />, },
            { path: "/Register", element: <Register />, },
        ]
    },
    {
        element: <LayoutPrivado requiredRole={3} />,
        children: [
            { path: "/Productos", element: <h1>Productos</h1>, },
            { path: "/Contacto", element: <h1>Contacto</h1>, },
        ],
    },
    {
        element: <LayoutPrivado requiredRole={2} />,
        children: [
            { path: "/Estadisticas", element: <Estadisticas />, },
        ],
    },
    {
        element: <LayoutPrivado requiredRole={1} />,
        children: [
            { path: "/Administrador", element: <h1>Administrador</h1>, },
        ],
    },
]);

export default router;
