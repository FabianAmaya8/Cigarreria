import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchMesa,
    agregarProductoMesa,
    editarProductoMesa,
    editarDistintoMesa,
    agregarRecarga,
    agregarChance,
    cerrarMesa,
    fetchMetodosPago,
} from "../services/pos.service";

export default function useMesa(idMesa) {
    const queryClient = useQueryClient();

    // ======================
    // MESA ACTIVA
    // ======================
    const mesaQuery = useQuery({
        queryKey: ["mesa", idMesa],
        queryFn: () => fetchMesa(idMesa),
        enabled: !!idMesa,
        staleTime: 30 * 1000,          // 🔥 NO refetch por render
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    // ======================
    // MÉTODOS DE PAGO (GLOBAL)
    // ======================
    const metodosPagoQuery = useQuery({
        queryKey: ["metodos-pago"],
        queryFn: fetchMetodosPago,
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const invalidateMesa = () => {
        queryClient.invalidateQueries({
            queryKey: ["mesa", idMesa],
            exact: true,
        });
    };

    // ======================
    // MUTATIONS
    // ======================
    const agregarProducto = useMutation({
        mutationFn: (payload) => agregarProductoMesa(idMesa, payload),
        onSuccess: invalidateMesa,
    });

    const editarProducto = useMutation({
        mutationFn: (payload) => editarProductoMesa(idMesa, payload),
        onSuccess: invalidateMesa,
    });

    const editarDistinto = useMutation({
        mutationFn: (payload) => editarDistintoMesa(idMesa, payload),
        onSuccess: invalidateMesa,
    });

    const recarga = useMutation({
        mutationFn: (valor) => agregarRecarga(idMesa, valor),
        onSuccess: invalidateMesa,
    });

    const chance = useMutation({
        mutationFn: (valor) => agregarChance(idMesa, valor),
        onSuccess: invalidateMesa,
    });

    const cerrar = useMutation({
        mutationFn: (payload) => cerrarMesa(idMesa, payload),
        onSuccess: () => {
            invalidateMesa();
            queryClient.removeQueries({
                queryKey: ["mesa", idMesa],
            });
        },
    });

    return {
        ...mesaQuery,
        agregarProducto,
        editarProducto,
        editarDistinto,
        recarga,
        chance,
        cerrar,
        metodosPagoQuery,
    };
}
