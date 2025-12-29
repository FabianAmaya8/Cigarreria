import { useEffect } from "react";
import { POS_CONFIG } from "../config/pos.config";

export default function useTecladoPOS({
    onMesaRapida,
    onMesaNueva,
    onMesaAnterior,
    onMesaSiguiente,
    onAbrirProducto,
    onAbrirRecarga,
    onAbrirChance,
    onCerrarVenta,
    onCerrarDeuda,
    onCerrarModal,
    onConfirmarModal,
    onFocusEscaner,
    onCambioAlmacen,
}) {
    useEffect(() => {
        const accionesPorTecla = {
            [POS_CONFIG.HOTKEYS.MESA_RAPIDA.key]: onMesaRapida,
            [POS_CONFIG.HOTKEYS.MESA_ANTERIOR.key]: onMesaAnterior,
            [POS_CONFIG.HOTKEYS.MESA_SIGUIENTE.key]: onMesaSiguiente,
            [POS_CONFIG.HOTKEYS.NUEVA_MESA.key]: onMesaNueva,
            [POS_CONFIG.HOTKEYS.CONSULTAR_PRODUCTO.key]: onAbrirProducto,
            [POS_CONFIG.HOTKEYS.CERRAR_VENTA.key]: onCerrarVenta,
            [POS_CONFIG.HOTKEYS.CERRAR_DEUDA.key]: onCerrarDeuda,
            [POS_CONFIG.HOTKEYS.AGREGAR_RECARGA.key]: onAbrirRecarga,
            [POS_CONFIG.HOTKEYS.AGREGAR_CHANCE.key]: onAbrirChance,
            [POS_CONFIG.HOTKEYS.CERRAR_MODAL.key]: onCerrarModal,
            [POS_CONFIG.HOTKEYS.CONFIRMAR.key]: onConfirmarModal,
            [POS_CONFIG.HOTKEYS.FOCUS_ESCANER.key]: onFocusEscaner,
            [POS_CONFIG.HOTKEYS.CAMBIO_ALMACEN.key]: onCambioAlmacen,
        };

        const handleKeyDown = (e) => {
            const accion = accionesPorTecla[e.key];

            if (!accion) return;

            e.preventDefault();
            accion?.();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        onMesaRapida,
        onMesaNueva,
        onMesaAnterior,
        onMesaSiguiente,
        onAbrirProducto,
        onAbrirRecarga,
        onAbrirChance,
        onCerrarVenta,
        onCerrarDeuda,
        onCerrarModal,
        onConfirmarModal,
        onFocusEscaner,
        onCambioAlmacen,
    ]);
}
