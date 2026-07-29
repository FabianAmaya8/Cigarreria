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
import Deudas from "./Components/Client/Tareas/Deudas";
import ListaDeudas from "./Components/Vendedor/Deudas/ListaDeudas";
import DetallesDeuda from "./Components/Vendedor/Deudas/DetallesDeuda";
import CrearDeuda from "./Components/Vendedor/Deudas/CrearDeuda";
import Catalogo from "./Components/Client/Tareas/Catalogo";
import Personal from "./Components/Client/Personal/Personal.jsx";
import GestionInventario from "./Components/Vendedor/GestionInventario/GestionInventario";
import ProductosView from "./Components/Vendedor/GestionInventario/CRUDsProductos/Productos";
import MarcasView from "./Components/Vendedor/GestionInventario/CrudMarcas/MarcasView";
import CategoriasView from "./Components/Vendedor/GestionInventario/CrudCategorias/CategoriasView";
import AlmacenesView from "./Components/Vendedor/GestionInventario/CrudAlmacenes/AlmacenesView";
import POSLayout from "./modules/Pos/pages/PosLayout";
import CierreDia from "./Components/Vendedor/CierreDia/CierreDia";
import Bolsillos from "./Components/Vendedor/CierreDia/Bolsillos";
import DashboardAdmin from "./Components/Admin/DashboardAdmin";

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
            { path: "/Deudas", element: <Deudas/>, },
            { path: "/Detallesdeuda/:id", element: <DetallesDeuda />, },
            { path: "/Catalogo", element: <Catalogo />, },
            { path: "/Personal", element: <Personal />, },
        ],
    },
    {
        element: <LayoutPrivado requiredRole={2} />,
        children: [
            { path: "/Estadisticas", element: <Estadisticas />, },
            { path: "/ListaDeudas", element: <ListaDeudas />, },
            { path: "/CrearDeuda", element: <CrearDeuda />, },
            { path: "/EditarDeuda", element: <ListaDeudas />, },

            // Gestion de Inventario
            { path: "/GestionInventario", element: <GestionInventario />, },
            { path: "/Gestion/Productos", element: <ProductosView />, },
            { path: "/Gestion/Marcas", element: <MarcasView />,},
            { path: "/Gestion/Categorias", element: <CategoriasView />,},
            { path: "/Gestion/Almacenes", element: <AlmacenesView />,},

            { path: "/CierreDia", element: <CierreDia />, },
            { path: "/CierreDia/Bolsillos", element: <Bolsillos />, },

            // Control de Ventas
            { path: "/POS", element: <POSLayout />, },
        ],
    },
    {
        element: <LayoutPrivado requiredRole={1} />,
        children: [
            { path: "/Administrador", element: <DashboardAdmin />, },
        ],
    },
]);

export default router;
