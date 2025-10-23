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
// Funciones API Productos
// ==========================

// 🟢 Listar todos los productos
async function fetchProductos() {
    const endpoint = "/api/productos/";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener los productos");
    return await res.json();
}

// 🟢 Buscar producto por código
async function fetchProductoPorCodigo(codigo) {
    const endpoint = `/api/productos/codigo/${codigo}`;
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Producto no encontrado");
    return await res.json();
}

// 🟢 Crear producto (usa FormData para imagen y datos)
async function crearProducto(data) {
    const endpoint = "/api/productos/";
    const urlFetch = await urlDB(endpoint);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, value);
    });

    const res = await fetch(urlFetch, {
        method: "POST",
        headers: getAuthHeaders(), // No poner Content-Type, lo maneja el navegador
        body: formData,
    });

    if (!res.ok) throw new Error("Error al crear el producto");
    return await res.json();
}

// 🟡 Actualizar producto (usa FormData, permite cambiar imagen)
async function actualizarProducto(id, data) {
    const endpoint = `/api/productos/${id}`;
    const urlFetch = await urlDB(endpoint);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, value);
    });

    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!res.ok) throw new Error("Error al actualizar el producto");
    return await res.json();
}

// ==========================
// Hook principal
// ==========================
export default function useCrudProductos() {
    const queryClient = useQueryClient();

    // Listar productos
    const productosQuery = useQuery({
        queryKey: ["productos"],
        queryFn: fetchProductos,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });

    // Crear producto
    const mutationCrear = useMutation({
        mutationFn: crearProducto,
        onSuccess: () => queryClient.invalidateQueries(["productos"]),
    });

    // Actualizar producto
    const mutationActualizar = useMutation({
        mutationFn: ({ id, data }) => actualizarProducto(id, data),
        onSuccess: () => queryClient.invalidateQueries(["productos"]),
    });

    // Buscar producto por código
    const buscarProductoPorCodigo = async (codigo) => {
        try {
            return await fetchProductoPorCodigo(codigo);
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    return {
        productos: productosQuery.data || [],
        isLoadingProductos: productosQuery.isLoading,
        errorProductos: productosQuery.error,

        crearProducto: mutationCrear.mutateAsync,
        actualizarProducto: mutationActualizar.mutateAsync,
        buscarProductoPorCodigo,

        isCreando: mutationCrear.isPending,
        isActualizando: mutationActualizar.isPending,
    };
}
