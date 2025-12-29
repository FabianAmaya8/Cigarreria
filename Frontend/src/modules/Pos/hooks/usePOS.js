import { useState, useCallback, useMemo, useEffect } from "react";
import { beep } from "../utils/beep";
import useMesa from "./useMesa";
import useMesas from "./useMesas";
import useScanProducto from "./useScanProducto";
import Swal from "sweetalert2";

import { POS_CONFIG } from "../config/pos.config";

export default function usePOS() {
    const [mesaActiva, setMesaActiva] = useState(
        POS_CONFIG.MESA_RAPIDA_ID);
    
    useEffect(() => {
        beep.enabled = POS_CONFIG.SOUND.ENABLED;
    }, []);

    const mesasQuery = useMesas();
    const [mesasLocal, setMesasLocal] = useState([]);
    const mesaHook = useMesa(mesaActiva);
    const scanMutation = useScanProducto();

    // ======================
    // MEMO FUNCTIONS
    // ======================
    const cambiarMesa = useCallback((idMesa) => {
        setMesaActiva(idMesa);
    }, []);

    const formatearPrecio = useCallback((precio) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(precio);
    }, []);

    // ======================
    // AGREGAR PRODUCTO
    // ======================
    const agregarProducto = useCallback(
        async (codigo, cantidad, idAlmacen) => {
            try {
                const producto = await scanMutation.mutateAsync(codigo);

                await mesaHook.agregarProducto.mutateAsync({
                    codigo_barras: producto.codigo_barras,
                    cantidad,
                    id_almacen: idAlmacen,
                });

                beep.play("scan");
            } catch (error) {
                beep.play("error");
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "error",
                    title:
                        error?.response?.data?.detail ||
                        error?.message ||
                        "Error al agregar producto",
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        },
        [scanMutation, mesaHook]
    );

    // ======================
    // CREAR MESA
    // ======================
    const crearMesa = useCallback(() => {
        const todasLasMesas = [
            ...(mesasQuery.data || []),
            ...mesasLocal,
        ];

        const ids = todasLasMesas
            .map(m => m.id_mesa)
            .filter(id => id !== POS_CONFIG.MESA_RAPIDA_ID);

        const nuevoId = ids.length ? Math.max(...ids) + 1 : 1;

        const nuevaMesa = {
            id_mesa: nuevoId,
            estado: "abierta",
            productos: [],
            recargas: [],
            chance: [],
            total: 0,
            esLocal: true,
        };

        setMesasLocal(prev => [...prev, nuevaMesa]);
        setMesaActiva(nuevoId);

        beep.play("scan");
    }, [mesasQuery.data, mesasLocal]);

    // ======================
    // DISTINTOS
    // ======================
    const agregarDistinto = useCallback(async (tipo, valor) => {
        try {
            tipo === "recarga"
                ? await mesaHook.recarga.mutateAsync(valor)
                : await mesaHook.chance.mutateAsync(valor);

            beep.play("scan");
        } catch (error) {
            beep.play("error");
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: error?.message || "Error al agregar",
                showConfirmButton: false,
                timer: 2000,
            });
        }
    }, [mesaHook]);

    // ======================
    //  EDITAR PRODUCTO
    // ======================
    const editarProducto = useCallback(async (idProducto, cantidad) => {
        try {
            await mesaHook.editarProducto.mutateAsync({ id_producto: idProducto, cantidad });
            beep.play("scan");
        } catch (error) {
            beep.play("error");
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: error?.message || "Error al agregar",
                showConfirmButton: false,
                timer: 2000,
            });
        }
    })

    // ======================
    //  EDITAR DISTINTO
    // ======================
    const editarDistinto = useCallback(async (tipo,valor, idDistinto) => {
        try {
            tipo === "recarga"
                ? await mesaHook.editarDistinto.mutateAsync({tipo, valor, id_recarga: idDistinto })
                : await mesaHook.editarDistinto.mutateAsync({tipo, valor, id_chance: idDistinto });

            beep.play("scan");
        } catch (error) {
            beep.play("error");
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: error?.message || "Error al agregar",
                showConfirmButton: false,
                timer: 2000,
            });
        }
    })

    // ======================
    // MEMO
    // ======================
    const mesas = useMemo(() => {
        return [
            ...(mesasQuery.data || []),
            ...mesasLocal,
        ];
    }, [mesasQuery.data, mesasLocal]);


    return {
        mesaRapidaId: POS_CONFIG.MESA_RAPIDA_ID,
        mesaActiva,
        cambiarMesa,

        mesas,
        mesa: mesaHook.data,

        crearMesa,

        agregarProducto,
        agregarDistinto,

        cerrarMesa: mesaHook.cerrar.mutateAsync,
        editarProducto,
        editarDistinto,

        metodosPagoQuery: mesaHook.metodosPagoQuery.data || [],
        formatearPrecio,
    };
}
