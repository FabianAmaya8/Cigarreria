import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

async function fetchBolsillos() {
    const urlFetch = await urlDB("/api/bolsillos");
    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener bolsillos");
    return await res.json();
}

async function crearBolsillo(data) {
    const urlFetch = await urlDB("/api/bolsillos");
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
        throw new Error(err.detail || "Error al crear bolsillo");
    }

    return await res.json();
}

async function actualizarBolsillo(data) {
    const { id_bolsillo, ...payload } = data;
    const urlFetch = await urlDB(`/api/bolsillos/${id_bolsillo}`);
    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al actualizar bolsillo");
    }

    return await res.json();
}

async function eliminarBolsillo(id_bolsillo) {
    const urlFetch = await urlDB(`/api/bolsillos/${id_bolsillo}`);
    const res = await fetch(urlFetch, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Error al eliminar bolsillo");
    }

    return await res.json();
}

async function moverBolsillo(data) {
    const urlFetch = await urlDB("/api/bolsillos/movimiento");
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
        throw new Error(err.detail || "Error movimiento");
    }

    return await res.json();
}

async function hacerPagoBolsillo(data) {
    const urlFetch = await urlDB("/api/bolsillos/pago");
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
        throw new Error(err.detail || "Error al registrar el pago");
    }

    return await res.json();
}

async function fetchMovimientos(desde, hasta) {
    const urlFetch = await urlDB(`/api/bolsillos/movimientos?desde=${desde}&hasta=${hasta}`);
    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener movimientos");
    return await res.json();
}

async function fetchTotalDisponible() {
    const urlFetch = await urlDB("/api/bolsillos/total-disponible");
    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error total disponible");
    return await res.json();
}

export default function useBolsillos() {
    const queryClient = useQueryClient();
    const hoy = getTodayLocalISO();

    const bolsillosQuery = useQuery({
        queryKey: ["bolsillos"],
        queryFn: fetchBolsillos,
        staleTime: 1000 * 60 * 5,
    });

    const totalQuery = useQuery({
        queryKey: ["bolsillos-total"],
        queryFn: fetchTotalDisponible,
        staleTime: 1000 * 60,
    });

    const movimientosQuery = useQuery({
        queryKey: ["bolsillos-movimientos", hoy],
        queryFn: () => fetchMovimientos(hoy, hoy),
        staleTime: 1000 * 60,
    });

    const crearMutation = useMutation({
        mutationFn: crearBolsillo,
        onSuccess: () => invalidateCierreDiaRelatedQueries(queryClient),
    });

    const actualizarMutation = useMutation({
        mutationFn: actualizarBolsillo,
        onSuccess: () => invalidateCierreDiaRelatedQueries(queryClient),
    });

    const eliminarMutation = useMutation({
        mutationFn: eliminarBolsillo,
        onSuccess: () => invalidateCierreDiaRelatedQueries(queryClient),
    });

    const moverMutation = useMutation({
        mutationFn: moverBolsillo,
        onSuccess: () => invalidateCierreDiaRelatedQueries(queryClient),
    });

    const pagoMutation = useMutation({
        mutationFn: hacerPagoBolsillo,
        onSuccess: () => invalidateCierreDiaRelatedQueries(queryClient),
    });

    const bolsillos = bolsillosQuery.data || [];
    const totalDisponible = Number(totalQuery.data?.total || 0);
    const totalAsignado = bolsillos.reduce((acc, bolsillo) => acc + Number(bolsillo.saldo_actual || 0), 0);
    const totalCierre = totalAsignado + totalDisponible;
    const porcentajeAsignado = totalCierre > 0 ? (totalAsignado / totalCierre) * 100 : 0;
    const porcentajeDisponible = totalCierre > 0 ? (totalDisponible / totalCierre) * 100 : 0;

    return {
        bolsillos,
        totalDisponible,
        totalAsignado,
        totalCierre,
        porcentajeAsignado,
        porcentajeDisponible,
        movimientos: movimientosQuery.data || [],
        isLoading: bolsillosQuery.isLoading || totalQuery.isLoading,
        isLoadingMovimientos: movimientosQuery.isLoading,
        error: bolsillosQuery.error || totalQuery.error || movimientosQuery.error,
        crearBolsillo: crearMutation.mutateAsync,
        actualizarBolsillo: actualizarMutation.mutateAsync,
        eliminarBolsillo: eliminarMutation.mutateAsync,
        moverBolsillo: moverMutation.mutateAsync,
        hacerPago: pagoMutation.mutateAsync,
        isCreando: crearMutation.isPending,
        isActualizando: actualizarMutation.isPending,
        isEliminando: eliminarMutation.isPending,
        isMoviendo: moverMutation.isPending,
        isPagando: pagoMutation.isPending,
        refetchBolsillos: bolsillosQuery.refetch,
        refetchMovimientos: movimientosQuery.refetch,
    };
}
