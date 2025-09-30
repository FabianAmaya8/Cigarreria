import { useQuery } from "@tanstack/react-query";
import { urlDB } from "../../urlDB";

async function fetchImagen(userId) {
    if (!userId) return null;
    const endpoint = `/api/usuarios/imagen/${userId}`;
    const urlFetch = await urlDB(endpoint);
    const res = await fetch(urlFetch);
    if (!res.ok) throw new Error("Error en la respuesta");
    const data = await res.json();
    return data.imagen;
}

export default function useImagen(userId) {
    return useQuery({
        queryKey: ["imagen", userId], 
        queryFn: () => fetchImagen(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // cache válido 5 minutos
        cacheTime: 1000 * 60 * 10, // mantiene cache 10 min aunque no se use
    });
}
