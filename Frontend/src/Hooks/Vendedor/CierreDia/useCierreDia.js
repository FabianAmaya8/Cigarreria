import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { urlDB } from "../../../urlDB";
import { getTodayLocalISO } from "../../../Components/Vendedor/CierreDia/cierreDia.utils";
import { invalidateCierreDiaRelatedQueries } from "./cierreDiaQueries";

function getAuthHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
        ...extra,
    };
}

async function fetchCierreDia(desde, hasta) {
    const endpoint = `/api/bolsillos/cierre-dia?desde=${desde}&hasta=${hasta}`;
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Error al obtener cierre");
    return await res.json();
}

async function guardarCierreDia(data) {
    const endpoint = "/api/bolsillos/cierre-dia";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al guardar cierre");
    }

    return await res.json();
}

export default function useCierreDia() {
    const queryClient = useQueryClient();
    const hoy = getTodayLocalISO();

    const [desde, setDesde] = useState(hoy);
    const [hasta, setHasta] = useState(hoy);

    const cierreQuery = useQuery({
        queryKey: ["cierre-dia", desde, hasta],
        queryFn: () => fetchCierreDia(desde, hasta),
        staleTime: 1000 * 60 * 2,
    });

    const guardarMutation = useMutation({
        mutationFn: guardarCierreDia,
        onSuccess: () => {
            invalidateCierreDiaRelatedQueries(queryClient);
        },
    });

    return {
        desde,
        hasta,
        setDesde,
        setHasta,
        cierreDia: cierreQuery.data || {
            cajas: [],
            ventas_por_producto: [],
            ventas_por_marca: [],
            ventas_por_categoria: [],
        },
        isLoading: cierreQuery.isLoading,
        error: cierreQuery.error,
        guardarCierreDia: guardarMutation.mutateAsync,
        isGuardando: guardarMutation.isPending,
        refetchCierreDia: cierreQuery.refetch,
    };
}
