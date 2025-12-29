import { useQuery } from "@tanstack/react-query";
import { useCatalogo, useProductosSinFiltro } from "../../../Hooks/Client/useCatalogo";
import { useUsuarios } from "../../../Hooks/Vendedor/useUsuarios";

export default function usePOSGlobal() {

    const catalogoQuery = useCatalogo({
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const productosSinFiltroQuery = useProductosSinFiltro({
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const usuariosQuery = useUsuarios({
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return {
        productos: catalogoQuery.data || [],
        productosLoading: catalogoQuery.isLoading,
        productosError: catalogoQuery.isError,

        productosSinFiltro: productosSinFiltroQuery.data || [],

        usuarios: usuariosQuery.data || [],
    };
}
