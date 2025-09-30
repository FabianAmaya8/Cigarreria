import { useQuery } from "@tanstack/react-query";
import { urlDB } from "../../../urlDB";

async function fetchDetallesDeuda(idDeuda) {
    if (!idDeuda) return null;

    const endpoint = `/api/deudas/${idDeuda}/detalles`;
    const urlFetch = await urlDB(endpoint);

    const token = localStorage.getItem("token");

    const res = await fetch(urlFetch, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Error en la respuesta del servidor");
    }

    return res.json();
}

export default function useDetallesDeuda(idDeuda) {
    return useQuery({
        queryKey: ["detallesDeuda", idDeuda],
        queryFn: () => fetchDetallesDeuda(idDeuda),
        enabled: !!idDeuda,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });
}
