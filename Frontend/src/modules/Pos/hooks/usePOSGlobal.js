import { useCatalogoProductos } from "../../../Hooks/Client/useCatalogo";
import { useUsuarios } from "../../../Hooks/Vendedor/useUsuarios";

export default function usePOSGlobal() {
    const rol = 2;

    const productosQuery = useCatalogoProductos(rol);

    const usuariosQuery = useUsuarios({
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return {
        productos: productosQuery.data || [],
        productosLoading: productosQuery.isLoading,
        productosError: productosQuery.isError,

        usuarios: usuariosQuery.data || [],
    };
}