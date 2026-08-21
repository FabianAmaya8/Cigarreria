import { useQuery } from "@tanstack/react-query";
import { urlDB } from "../../urlDB";

export function useCatalogoProductos(rol) {

    async function fetchData() {
        const endpoint =
            rol === 1 || rol === 2
                ? "/api/productos/sin_filtro"
                : "/api/productos";

        const urlFetch = await urlDB(endpoint);
        const res = await fetch(urlFetch);

        if (!res.ok) throw new Error("Error en la respuesta");

        return await res.json();
    }

    return useQuery({
        queryKey: ["catalogoProductos", rol],
        queryFn: fetchData,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });
}