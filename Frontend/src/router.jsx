import { createBrowserRouter } from "react-router-dom";

//Layouts
import Layoutusuario from "./Pages/Layoutusuario";

//Paginas
import Login from "./Components/User/DatosPersonales/Login";

const router = createBrowserRouter([
    {
        element: <Layoutusuario />,
        children: [
            {
                path: "/",
                element: <Login />,
            },
            {
                path: "/Productos",
                element: <h1>Productos</h1>,
            },
            {
                path: "/Contacto",
                element: <h1>Contacto</h1>,
            },
        ],
    },
]);

export default router;
