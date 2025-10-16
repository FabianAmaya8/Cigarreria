import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { urlDB } from "../../urlDB";

// Helper para obtener token
function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        ...extraHeaders,
    };
}

// 🧩 1️⃣ Obtener perfil del usuario actual
async function fetchPerfil() {
    const endpoint = "/api/perfil/";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
    });

    if (!res.ok) throw new Error("Error al obtener perfil");
    return await res.json();
}

// 🧩 2️⃣ Actualizar datos personales
async function actualizarDatos(datos) {
    const endpoint = "/api/perfil/datos";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(datos),
    });

    if (!res.ok) throw new Error("Error al actualizar los datos personales");
    return await res.json();
}

// 🧩 3️⃣ Cambiar contraseña
async function cambiarPassword(datos) {
    const endpoint = "/api/perfil/password";
    const urlFetch = await urlDB(endpoint);

    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(datos),
    });

    if (!res.ok) throw new Error("Error al cambiar la contraseña");
    return await res.json();
}

// 🧩 4️⃣ Cambiar imagen de perfil
async function actualizarImagen(file) {
    const endpoint = "/api/perfil/imagen";
    const urlFetch = await urlDB(endpoint);
    const formData = new FormData();
    formData.append("imagen", file);

    const res = await fetch(urlFetch, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
    });

    if (!res.ok) throw new Error("Error al subir la imagen");
    return await res.json();
}

// Hook principal
export default function useInfoPersonal( userId ) {
    const queryClient = useQueryClient();

    // Obtener información personal
    const perfilQuery = useQuery({
        queryKey: ["perfilUsuario", userId],
        queryFn: fetchPerfil,
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
    });

    // Mutación para actualizar datos personales
    const mutationActualizar = useMutation({
        mutationFn: actualizarDatos,
        onSuccess: () => {
            queryClient.invalidateQueries(["perfilUsuario"]);
        },
    });

    // Mutación para cambiar contraseña
    const mutationPassword = useMutation({
        mutationFn: cambiarPassword,
    });

    // Mutación para actualizar imagen
    const mutationImagen = useMutation({
        mutationFn: actualizarImagen,
        onSuccess: () => {
            queryClient.invalidateQueries(["perfilUsuario"]);
        },
    });

    return {
        // Datos
        perfil: perfilQuery.data,
        isLoadingPerfil: perfilQuery.isLoading,
        errorPerfil: perfilQuery.error,

        // Funciones
        actualizarDatos: mutationActualizar.mutateAsync,
        cambiarPassword: mutationPassword.mutateAsync,
        actualizarImagen: mutationImagen.mutateAsync,

        // Estados
        isActualizando: mutationActualizar.isPending,
        isCambiandoPassword: mutationPassword.isPending,
        isSubiendoImagen: mutationImagen.isPending,
    };
}
