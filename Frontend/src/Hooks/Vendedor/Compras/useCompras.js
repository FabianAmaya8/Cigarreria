import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestJson } from "../../../Utils/apiClient";

export function useProductosCompra() {
    return useQuery({
        queryKey: ["compras-productos"],
        queryFn: () => requestJson("/api/productos/sin_filtro", { fallbackError: "Error al obtener productos" }),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}

export function useBolsillosCompra() {
    return useQuery({
        queryKey: ["compras-bolsillos"],
        queryFn: () => requestJson("/api/bolsillos/", { fallbackError: "Error al obtener bolsillos" }),
        staleTime: 1000 * 60 * 3,
    });
}

export function useCajasCompra() {
    return useQuery({
        queryKey: ["compras-cajas"],
        queryFn: async () => {
            const data = await requestJson("/api/bolsillos/cierre-dia", { fallbackError: "Error al obtener cajas" });
            return Array.isArray(data?.cajas) ? data.cajas : [];
        },
        staleTime: 1000 * 60 * 3,
    });
}

export function useCompras(filtros = {}) {
    return useQuery({
        queryKey: ["compras", filtros],
        queryFn: () => {
            const params = new URLSearchParams();
            if (filtros.id_proveedor) params.set("id_proveedor", String(filtros.id_proveedor));
            if (filtros.estado_pago) params.set("estado_pago", filtros.estado_pago);
            if (filtros.estado_recepcion) params.set("estado_recepcion", filtros.estado_recepcion);
            const endpoint = params.toString() ? `/api/compras/?${params.toString()}` : "/api/compras/";
            return requestJson(endpoint, { fallbackError: "Error al obtener compras" });
        },
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
    });
}

export function useCompra(idCompra, enabled = true) {
    return useQuery({
        queryKey: ["compra", idCompra],
        queryFn: () => requestJson(`/api/compras/${idCompra}`, { fallbackError: "Error al obtener compra" }),
        enabled: Boolean(idCompra) && enabled,
        staleTime: 1000 * 60 * 2,
    });
}

export function useComprasPendientesPago() {
    return useQuery({
        queryKey: ["compras-pendientes-pago"],
        queryFn: () => requestJson("/api/compras/reportes/compras-pendientes", { fallbackError: "Error al obtener compras pendientes" }),
        staleTime: 1000 * 60 * 2,
    });
}

export function useHistorialPrecios(filtros = {}) {
    return useQuery({
        queryKey: ["compras-historial-precios", filtros],
        queryFn: () => {
            const params = new URLSearchParams();
            if (filtros.id_producto) params.set("id_producto", String(filtros.id_producto));
            if (filtros.id_proveedor) params.set("id_proveedor", String(filtros.id_proveedor));
            if (filtros.desde) params.set("desde", filtros.desde);
            if (filtros.hasta) params.set("hasta", filtros.hasta);
            const endpoint = params.toString()
                ? `/api/compras/reportes/historial-precios?${params.toString()}`
                : "/api/compras/reportes/historial-precios";
            return requestJson(endpoint, { fallbackError: "Error al obtener historial de precios" });
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useCompensacionesPendientes() {
    return useQuery({
        queryKey: ["compras-compensaciones-pendientes"],
        queryFn: () => requestJson("/api/compras/reportes/compensaciones-pendientes", { fallbackError: "Error al obtener compensaciones" }),
        staleTime: 1000 * 60 * 2,
    });
}

export function useLibroMayor(filtros = {}) {
    return useQuery({
        queryKey: ["compras-libro-mayor", filtros],
        queryFn: () => {
            const params = new URLSearchParams();
            if (filtros.desde) params.set("desde", filtros.desde);
            if (filtros.hasta) params.set("hasta", filtros.hasta);
            if (filtros.tipo_movimiento) params.set("tipo_movimiento", filtros.tipo_movimiento);
            if (filtros.origen_tipo) params.set("origen_tipo", filtros.origen_tipo);
            if (filtros.destino_tipo) params.set("destino_tipo", filtros.destino_tipo);
            const endpoint = params.toString()
                ? `/api/compras/reportes/libro-mayor?${params.toString()}`
                : "/api/compras/reportes/libro-mayor";
            return requestJson(endpoint, { fallbackError: "Error al obtener libro mayor" });
        },
        staleTime: 1000 * 60 * 2,
    });
}

export function useAlertasCompra(idCompra, enabled = true) {
    return useQuery({
        queryKey: ["compras-alertas", idCompra],
        queryFn: () => requestJson(`/api/compras/${idCompra}/alertas`, { fallbackError: "Error al obtener alertas" }),
        enabled: Boolean(idCompra) && enabled,
        staleTime: 1000 * 60 * 1,
    });
}

export function useCrearCompra() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => requestJson("/api/compras/", { method: "POST", body: data, fallbackError: "No se pudo crear la compra" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compras"] });
            queryClient.invalidateQueries({ queryKey: ["compras-pendientes-pago"] });
        },
    });
}

export function useActualizarCompra() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ idCompra, data }) => requestJson(`/api/compras/${idCompra}`, { method: "PUT", body: data, fallbackError: "No se pudo actualizar la compra" }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["compras"] });
            queryClient.invalidateQueries({ queryKey: ["compra", variables?.idCompra] });
            queryClient.invalidateQueries({ queryKey: ["compras-pendientes-pago"] });
        },
    });
}

export function useRecibirCompra() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ idCompra, data }) => requestJson(`/api/compras/${idCompra}/recepcion`, { method: "POST", body: data, fallbackError: "No se pudo registrar la recepcion" }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["compras"] });
            queryClient.invalidateQueries({ queryKey: ["compra", variables?.idCompra] });
            queryClient.invalidateQueries({ queryKey: ["compras-pendientes-pago"] });
            queryClient.invalidateQueries({ queryKey: ["compras-productos"] });
        },
    });
}

export function useRegistrarPagoCompra() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ idCompra, data }) => requestJson(`/api/compras/${idCompra}/pagos`, { method: "POST", body: data, fallbackError: "No se pudo registrar el pago" }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["compras"] });
            queryClient.invalidateQueries({ queryKey: ["compra", variables?.idCompra] });
            queryClient.invalidateQueries({ queryKey: ["compras-pendientes-pago"] });
            queryClient.invalidateQueries({ queryKey: ["compras-libro-mayor"] });
            queryClient.invalidateQueries({ queryKey: ["compras-cajas"] });
            queryClient.invalidateQueries({ queryKey: ["compras-bolsillos"] });
        },
    });
}

export function useAnularPagoCompra() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (idPagoCompra) => requestJson(`/api/compras/pagos/${idPagoCompra}/anular`, { method: "POST", fallbackError: "No se pudo anular el pago" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compras"] });
            queryClient.invalidateQueries({ queryKey: ["compras-pendientes-pago"] });
            queryClient.invalidateQueries({ queryKey: ["compras-libro-mayor"] });
            queryClient.invalidateQueries({ queryKey: ["compras-cajas"] });
            queryClient.invalidateQueries({ queryKey: ["compras-bolsillos"] });
        },
    });
}

export function useRegistrarDevolucionCompra() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ idCompra, data }) => requestJson(`/api/compras/${idCompra}/devoluciones`, { method: "POST", body: data, fallbackError: "No se pudo registrar la devolucion" }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["compras"] });
            queryClient.invalidateQueries({ queryKey: ["compra", variables?.idCompra] });
            queryClient.invalidateQueries({ queryKey: ["compras-productos"] });
            queryClient.invalidateQueries({ queryKey: ["compras-libro-mayor"] });
        },
    });
}

export function useCrearCompensacion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => requestJson("/api/compras/compensaciones", { method: "POST", body: data, fallbackError: "No se pudo crear la compensacion" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compras-compensaciones-pendientes"] });
            queryClient.invalidateQueries({ queryKey: ["compras-libro-mayor"] });
        },
    });
}

export function useAbonarCompensacion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ idCompensacion, monto }) => requestJson(`/api/compras/compensaciones/${idCompensacion}/abonar?monto=${monto}`, { method: "POST", fallbackError: "No se pudo abonar la compensacion" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["compras-compensaciones-pendientes"] });
            queryClient.invalidateQueries({ queryKey: ["compras-libro-mayor"] });
        },
    });
}
