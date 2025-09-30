import { useQuery } from "@tanstack/react-query";
import { urlDB } from "../../../urlDB";

async function fetchDeuda(userId) {
    if (!userId) return null;
    const endpoint = `/api/deudas/usuario/${userId}`;
    const urlFetch = await urlDB(endpoint);
    const res = await fetch(urlFetch);
    if (!res.ok) throw new Error("Error en la respuesta");
    const data = await res.json();
    return data;
}

export default function useDeudasUsuario(userId) {
    return useQuery({
        queryKey: ["deudaUsuario", userId], 
        queryFn: () => fetchDeuda(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });
}
