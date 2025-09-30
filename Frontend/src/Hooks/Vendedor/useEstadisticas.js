import { useQuery } from "@tanstack/react-query";
import { findWorkingBaseUrl } from "../../urlDB";

const urlDB = findWorkingBaseUrl();

async function fetchEstadistica(endpoint, limit) {
    const res = await fetch(`${urlDB}api/estadisticas/${endpoint}?limit=${limit}`);
    if (!res.ok) throw new Error(`Error en ${endpoint}`);
    return res.json();
}

export function useEstadisticas(limit = 3) {
    const masVendidosQuery = useQuery({
        queryKey: ["estadisticas", "mas_vendidos", limit],
        queryFn: () => fetchEstadistica("mas_vendidos", limit),
        staleTime: 1000 * 60 * 5,
    });

    const menosVendidosQuery = useQuery({
        queryKey: ["estadisticas", "menos_vendidos", limit],
        queryFn: () => fetchEstadistica("menos_vendidos", limit),
        staleTime: 1000 * 60 * 5,
    });

    const masIngresosQuery = useQuery({
        queryKey: ["estadisticas", "mas_ingresos", limit],
        queryFn: () => fetchEstadistica("mas_ingresos", limit),
        staleTime: 1000 * 60 * 5,
    });

    const menosStockQuery = useQuery({
        queryKey: ["estadisticas", "menos_stock", limit],
        queryFn: () => fetchEstadistica("menos_stock", limit),
        staleTime: 1000 * 60 * 5,
    });

    return {
        masVendidos: masVendidosQuery.data ?? [],
        menosVendidos: menosVendidosQuery.data ?? [],
        masIngresos: masIngresosQuery.data ?? [],
        menosStock: menosStockQuery.data ?? [],
        loading: {
            masVendidos: masVendidosQuery.isLoading,
            menosVendidos: menosVendidosQuery.isLoading,
            masIngresos: masIngresosQuery.isLoading,
            menosStock: menosStockQuery.isLoading,
        },
        error: {
            masVendidos: masVendidosQuery.error?.message ?? null,
            menosVendidos: menosVendidosQuery.error?.message ?? null,
            masIngresos: masIngresosQuery.error?.message ?? null,
            menosStock: menosStockQuery.error?.message ?? null,
        },
    };
}
