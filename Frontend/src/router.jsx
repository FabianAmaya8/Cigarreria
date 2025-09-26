import { createBrowserRouter } from "react-router-dom";

//Layouts
import Layoutusuario from "./Pages/Layouts/Layoutusuario";

//Paginas
import Login from "./Components/User/DatosPersonales/Login";
import Register from "./Components/User/DatosPersonales/Register";

//Funcionales
import CerrarSesion from "./Pages/Funcionales/CerrarSesiones";
import Error404 from "./Pages/Funcionales/Error404";

const router = createBrowserRouter([
    {
        element: <Layoutusuario />,
        children: [
            {
                path: "/",
                element: <h1>Home</h1>,
            },
            {
                path: "/logout",
                element: <CerrarSesion />,
            },
            {
                path: "*",
                element: <Error404 />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/Register",
                element: <Register />,
            },
            {
                path: "/Productos",
                element: <h1>Productos</h1>,
            },
            {
                path: "/Contacto",
                element: <h1>Contacto</h1>,
            },
            {
                path: "/Administrador",
                element: <h1>Administrador</h1>,
            },
            {
                path: "/Moderador",
                element: <h1>Moderador</h1>,
            },
            {
                path: "/inicio",
                element: <h1>Usuario</h1>,
            },
        ],
    },
]);

export default router;
