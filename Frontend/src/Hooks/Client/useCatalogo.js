import { useQuery } from "@tanstack/react-query";
import { urlDB } from "../../urlDB";

async function fetchCatalogo() {
    const endpoint = `/api/productos/`;
    const urlFetch = await urlDB(endpoint);
    const res = await fetch(urlFetch);
    if (!res.ok) throw new Error("Error en la respuesta");
    const data = await res.json();
    return data;
}

export default function useListaDeudas() {
    return useQuery({
        queryKey: ["Catalogo"], 
        queryFn: () => fetchCatalogo(),
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });
}
