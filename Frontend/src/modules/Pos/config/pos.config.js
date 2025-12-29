export const POS_CONFIG = {
    // ======================
    // MESAS
    // ======================
    MESA_RAPIDA_ID: 100,
    MESA_INICIAL_ID: 1,

    // ======================
    // TECLAS RAPIDAS
    // ======================
    HOTKEYS: {
        MESA_RAPIDA: {
            key: "F1",
            label: "Mesa rápida",
        },
        MESA_ANTERIOR: {
            key: "F2",
            label: "Mesa anterior",
        },
        MESA_SIGUIENTE: {
            key: "F3",
            label: "Mesa siguiente",
        },
        NUEVA_MESA: {
            key: "F4",
            label: "Nueva mesa",
        },
        CONSULTAR_PRODUCTO: {
            key: "F5",
            label: "Consultar producto",
        },
        CERRAR_VENTA: {
            key: "F7",
            label: "Cerrar venta",
        },
        CERRAR_DEUDA: {
            key: "F8",
            label: "Cerrar deuda",
        },
        AGREGAR_RECARGA: {
            key: "F9",
            label: "Agregar recarga",
        },
        AGREGAR_CHANCE: {
            key: "F10",
            label: "Agregar chance",
        },
        CONFIRMAR: {
            key: "Enter",
            label: "Confirmar",
        },
        CERRAR_MODAL: {
            key: "Escape",
            label: "Cerrar modal",
        },
        FOCUS_ESCANER: {
            key: "|",
            label: "Focus escaner",
        },
        CAMBIO_ALMACEN: {
            key: "ArrowUp",
            label: "Cambio almacen",
        },
    },

    // ======================
    // SONIDOS
    // ======================
    SOUND: {
        ENABLED: true,
        SCAN: "scan",
        ERROR: "error",
    },

    // ======================
    // LIMITES
    // ======================
    LIMITS: {
        MAX_CANTIDAD_PRODUCTO: 999,
        MAX_MESAS_ABIERTAS: 20,
    },

    // ======================
    // TEXTOS
    // ======================
    LABELS: {
        MESA_RAPIDA: "Rápida",
        NUEVA_MESA: "+ Mesa",
        TOTAL: "Total",
        DEUDA: "Deuda",
        PAGAR: "Pagar",
    },
};
