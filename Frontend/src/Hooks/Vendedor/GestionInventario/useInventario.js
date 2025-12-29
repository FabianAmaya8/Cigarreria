import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlDB } from "../../../urlDB";

// ==========================
// Helper para obtener token
// ==========================
function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
        ...extraHeaders,
    };
}

// ==========================
// Funciones API Inventario
// ==========================

// 🟢 Listar todo el inventario
async function fetchInventario() {
    const endpoint = "/api/inventario/";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener el inventario");
    return await res.json();
}

// 🟢 Obtener stock de un producto
async function fetchStockProducto(id_producto) {
    const endpoint = `/api/inventario/producto/${id_producto}`;
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener el stock del producto");
    return await res.json();
}

// 🟢 Crear nuevo registro en inventario
async function crearInventario(data) {
    const endpoint = "/api/inventario/";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al crear el inventario");
    return await res.json();
}

// 🟡 Actualizar stock en un almacén
async function actualizarStock({ id_inventario, data }) {
    const endpoint = `/api/inventario/${id_inventario}`;
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar el stock");
    return await res.json();
}

// 🔄 Transferir stock entre almacenes
async function transferirStock(data) {
    const endpoint = `/api/inventario/transferir-stock`;
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al transferir el stock");
    return await res.json();
}

// ==========================
// Hook principal
// ==========================
export default function useInventario() {
    const queryClient = useQueryClient();

    // 📦 Listar inventario
    const inventarioQuery = useQuery({
        queryKey: ["inventario"],
        queryFn: fetchInventario,
        staleTime: 1000 * 60 * 5,
    });

    // 📦 Obtener stock por producto
    const obtenerStockProducto = async (id_producto) => {
        try {
            return await fetchStockProducto(id_producto);
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // ➕ Crear inventario
    const mutationCrear = useMutation({
        mutationFn: crearInventario,
        onSuccess: () => queryClient.invalidateQueries(["inventario"]),
    });

    // 🔄 Actualizar stock
    const mutationActualizar = useMutation({
        mutationFn: actualizarStock,
        onSuccess: () => queryClient.invalidateQueries(["inventario"]),
    });

    // 🔁 Transferir stock
    const mutationTransferir = useMutation({
        mutationFn: transferirStock,
        onSuccess: () => queryClient.invalidateQueries(["inventario"]),
    });

    return {
        inventario: inventarioQuery.data || [],
        isLoadingInventario: inventarioQuery.isLoading,
        errorInventario: inventarioQuery.error,

        crearInventario: mutationCrear.mutateAsync,
        actualizarStock: mutationActualizar.mutateAsync,
        transferirStock: mutationTransferir.mutateAsync,
        obtenerStockProducto,

        isCreando: mutationCrear.isPending,
        isActualizando: mutationActualizar.isPending,
        isTransfiriendo: mutationTransferir.isPending,
    };
}
