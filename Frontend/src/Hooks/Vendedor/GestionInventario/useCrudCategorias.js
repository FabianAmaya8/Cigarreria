import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlDB } from "../../../urlDB";

// ==========================
// Helper para obtener token
// ==========================
function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        ...extraHeaders,
    };
}

// ==========================
// 📁 FUNCIONES API CATEGORÍAS
// ==========================
async function fetchCategorias() {
    const endpoint = "/api/productos/categorias";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener categorías");
    return await res.json();
}

async function crearCategoria(data) {
    const endpoint = "/api/productos/categorias";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al crear categoría");
    return await res.json();
}

async function actualizarCategoria(id, data) {
    const endpoint = `/api/productos/categorias/${id}`;
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar categoría");
    return await res.json();
}

// ==========================
// 🏷️ FUNCIONES API MARCAS
// ==========================
async function fetchMarcas() {
    const endpoint = "/api/productos/marcas";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener marcas");
    return await res.json();
}

async function crearMarca(data) {
    const endpoint = "/api/productos/marcas";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al crear marca");
    return await res.json();
}

async function actualizarMarca(id, data) {
    const endpoint = `/api/productos/marcas/${id}`;
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar marca");
    return await res.json();
}

// ==========================
// ⚙️ HOOK PRINCIPAL CRUD
// ==========================
export default function useCrudCategorias() {
    const queryClient = useQueryClient();

    // === CATEGORÍAS ===
    const categoriasQuery = useQuery({
        queryKey: ["categorias"],
        queryFn: fetchCategorias,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });

    const mutationCrearCategoria = useMutation({
        mutationFn: crearCategoria,
        onSuccess: () => queryClient.invalidateQueries(["categorias"]),
    });

    const mutationActualizarCategoria = useMutation({
        mutationFn: ({ id, data }) => actualizarCategoria(id, data),
        onSuccess: () => queryClient.invalidateQueries(["categorias"]),
    });

    // === MARCAS ===
    const marcasQuery = useQuery({
        queryKey: ["marcas"],
        queryFn: fetchMarcas,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });

    const mutationCrearMarca = useMutation({
        mutationFn: crearMarca,
        onSuccess: () => queryClient.invalidateQueries(["marcas"]),
    });

    const mutationActualizarMarca = useMutation({
        mutationFn: ({ id, data }) => actualizarMarca(id, data),
        onSuccess: () => queryClient.invalidateQueries(["marcas"]),
    });

    return {
        // === Categorías ===
        categorias: categoriasQuery.data || [],
        isLoadingCategorias: categoriasQuery.isLoading,
        errorCategorias: categoriasQuery.error,
        crearCategoria: mutationCrearCategoria.mutateAsync,
        actualizarCategoria: mutationActualizarCategoria.mutateAsync,
        isCreandoCategoria: mutationCrearCategoria.isPending,
        isActualizandoCategoria: mutationActualizarCategoria.isPending,

        // === Marcas ===
        marcas: marcasQuery.data || [],
        isLoadingMarcas: marcasQuery.isLoading,
        errorMarcas: marcasQuery.error,
        crearMarca: mutationCrearMarca.mutateAsync,
        actualizarMarca: mutationActualizarMarca.mutateAsync,
        isCreandoMarca: mutationCrearMarca.isPending,
        isActualizandoMarca: mutationActualizarMarca.isPending,
    };
}
