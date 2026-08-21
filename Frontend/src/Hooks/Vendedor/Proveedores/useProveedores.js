import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestJson } from "../../../Utils/apiClient";

export function useProveedores({ buscar = "", activo } = {}) {
    return useQuery({
        queryKey: ["proveedores", { buscar, activo }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (buscar) params.set("buscar", buscar);
            if (activo !== undefined && activo !== null && activo !== "") {
                params.set("activo", String(activo));
            }
            const endpoint = params.toString()
                ? `/api/proveedores/?${params.toString()}`
                : "/api/proveedores/";
            return requestJson(endpoint, { fallbackError: "Error al obtener proveedores" });
        },
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 10,
    });
}

export function useProveedor(idProveedor, enabled = true) {
    return useQuery({
        queryKey: ["proveedor", idProveedor],
        queryFn: () => requestJson(`/api/proveedores/${idProveedor}`, { fallbackError: "Error al obtener proveedor" }),
        enabled: Boolean(idProveedor) && enabled,
        staleTime: 1000 * 60 * 3,
    });
}

export function useProveedorYO() {
    return useQuery({
        queryKey: ["proveedor-yo"],
        queryFn: () => requestJson("/api/proveedores/yo", { fallbackError: "No se pudo obtener el proveedor YO" }),
        staleTime: 1000 * 60 * 10,
    });
}

export function useProductosRelacionadosProveedor(idProveedor, enabled = true) {
    return useQuery({
        queryKey: ["proveedor-productos", idProveedor],
        queryFn: () => requestJson(`/api/proveedores/${idProveedor}/productos-relacionados`, { fallbackError: "No se pudieron obtener los productos relacionados" }),
        enabled: Boolean(idProveedor) && enabled,
        staleTime: 1000 * 60 * 5,
    });
}

export function useComprasProveedor(idProveedor, enabled = true) {
    return useQuery({
        queryKey: ["proveedor-compras", idProveedor],
        queryFn: () => requestJson(`/api/proveedores/${idProveedor}/compras`, { fallbackError: "No se pudieron obtener las compras del proveedor" }),
        enabled: Boolean(idProveedor) && enabled,
        staleTime: 1000 * 60 * 3,
    });
}

export function useHistorialPreciosProveedor(idProveedor, enabled = true) {
    return useQuery({
        queryKey: ["proveedor-historial-precios", idProveedor],
        queryFn: () => requestJson(`/api/proveedores/${idProveedor}/historial-precios`, { fallbackError: "No se pudo obtener el historial de precios" }),
        enabled: Boolean(idProveedor) && enabled,
        staleTime: 1000 * 60 * 3,
    });
}

export function useCrearProveedor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => requestJson("/api/proveedores/", { method: "POST", body: data, fallbackError: "No se pudo crear el proveedor" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["proveedores"] });
            queryClient.invalidateQueries({ queryKey: ["proveedor-yo"] });
        },
    });
}

export function useActualizarProveedor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ idProveedor, data }) => requestJson(`/api/proveedores/${idProveedor}`, { method: "PUT", body: data, fallbackError: "No se pudo actualizar el proveedor" }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["proveedores"] });
            queryClient.invalidateQueries({ queryKey: ["proveedor", variables?.idProveedor] });
            queryClient.invalidateQueries({ queryKey: ["proveedor-yo"] });
        },
    });
}
