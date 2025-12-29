import { useMutation } from "@tanstack/react-query";
import { obtenerProductoPorCodigo } from "../services/pos.service";

export default function useScanProducto() {
    return useMutation({
        mutationFn: (codigo) => obtenerProductoPorCodigo(codigo),
    });
}
