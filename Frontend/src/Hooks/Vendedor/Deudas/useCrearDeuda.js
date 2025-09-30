import { useMutation } from "@tanstack/react-query";
import { urlDB } from "../../../urlDB";

async function crearDeudaApi(deuda) {
    const url = await urlDB("/api/deudas/");
    const res = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(deuda),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al crear deuda");
    }

    return res.json();
    }

    export function useCrearDeuda() {
    return useMutation({
        mutationFn: crearDeudaApi,
    });
}
