import { useState, useRef } from "react";
import styles from "../../../assets/Css/Pos/posLayout.module.scss";

import { POS_CONFIG } from "../config/pos.config";
import usePOS from "../hooks/usePOS";
import usePOSGlobal from "../hooks/usePOSGlobal";
import useTecladoPOS from "../hooks/useTecladoPOS";
import { calcularTotales } from "../utils/totales";

import PosHeader from "../components/header/PosHeader";
import PosFooter from "../components/footer/PosFooter";

import { ScanInput, SelectorAlmacen } from "../components/productos/ScanInput";
import BuscadorProducto from "../components/productos/BuscadorProducto";
import TicketProductos from "../components/productos/TicketProductos";

import MesasPanel from "../components/mesas/MesasPanel";
import AccionesMesa from "../components/acciones/AccionesMesa";

import ModalCerrarMesa from "../components/modals/ModalCerrarMesa";
import ModalDistinto from "../components/modals/ModalDistinto";
import ModalProducto from "../components/modals/ModalProducto";

export default function POSLayout() { 
    // 🔥 DATOS GLOBALES (UNA SOLA VEZ)
    const {
        productos,
        productosLoading,
        productosError,
        productosSinFiltro,
        usuarios,
    } = usePOSGlobal();

    // POS (SOLO MESA ACTIVA)
    const {
        mesaActiva,
        mesas,
        mesa,
        cambiarMesa,
        crearMesa,
        agregarProducto,
        editarProducto,
        agregarDistinto,
        editarDistinto,
        cerrarMesa,
        metodosPagoQuery,
        formatearPrecio,
    } = usePOS();

    // REFS MODALES
    const confirmarCerrarMesaRef = useRef(null);
    const confirmarDistintoRef = useRef(null);
    const scanInputRef = useRef(null);

    // ESTADOS UI
    const [almacen, setAlmacen] = useState(2);
    const [openCerrarMesa, setOpenCerrarMesa] = useState(false);
    const [tipoCierre, setTipoCierre] = useState("venta");
    const [openDistinto, setOpenDistinto] = useState(false);
    const [tipoDistinto, setTipoDistinto] = useState("recarga");
    const [openProducto, setOpenProducto] = useState(false);
    const mesasIds = mesas.map(m => m.id_mesa);
    const indexActual = mesasIds.indexOf(mesaActiva);
    const focusScanner = () => {
        scanInputRef.current?.focus();
    };

    // TECLADO POS
    useTecladoPOS({
        onMesaRapida: () => cambiarMesa(POS_CONFIG.MESA_RAPIDA_ID),
        onMesaNueva: () => crearMesa(),
        onMesaAnterior: () => {
            if (indexActual === -1) return;
            const nuevoIndex =
                indexActual === 0
                    ? mesasIds.length - 1
                    : indexActual - 1;
            cambiarMesa(mesasIds[nuevoIndex]);
        },
        onMesaSiguiente: () => {
            if (indexActual === -1) return;
            const nuevoIndex =
                indexActual === mesasIds.length - 1
                    ? 0
                    : indexActual + 1;
            cambiarMesa(mesasIds[nuevoIndex]);
        },
        onAbrirProducto: () => setOpenProducto(true),
        onAbrirRecarga: () => {
            setTipoDistinto("recarga");
            setOpenDistinto(true);
        },
        onAbrirChance: () => {
            setTipoDistinto("chance");
            setOpenDistinto(true);
        },
        onCerrarVenta: () => {
            setTipoCierre("venta");
            setOpenCerrarMesa(true);
        },
        onCerrarDeuda: () => {
            setTipoCierre("deuda");
            setOpenCerrarMesa(true);
        },
        onCerrarModal: () => {
            setOpenCerrarMesa(false);
            setOpenDistinto(false);
            setOpenProducto(false);

            focusScanner();
        },
        onConfirmarModal: () => {
            if (openCerrarMesa) {
                confirmarCerrarMesaRef.current?.confirmar();
            }
            if (openDistinto) {
                confirmarDistintoRef.current?.confirmar?.();
            }
        },
        onFocusEscaner: () => focusScanner(),
        onCambioAlmacen: () => setAlmacen(almacen === 1 ? 2 : 1),
    });
    // MESAS (SIN MESA 100)
    const mesasFiltradas = mesas.filter(m => m.id_mesa !== POS_CONFIG.MESA_RAPIDA_ID);

    // TOTALES
    const {
        productos: totalProductos,
        recargas: totalRecargas,
        chance: totalChance,
        total,
        cantidadItems,
    } = calcularTotales(mesa);

    return (
        <div className={styles.pos}>

            {/* HEADER */}
            <PosHeader
                mesaActiva={mesaActiva}
                estadoMesa={mesa?.estado}
            />

            {/* MAIN */}
            <main className={styles.main}>

                <section className={styles.productos}>
                    <div className={styles.sectionEscanner}>
                        <ScanInput
                            ref={scanInputRef}
                            agregarProducto={agregarProducto}
                            almacen={almacen}
                        />

                        <BuscadorProducto
                            agregarProducto={agregarProducto}
                            almacen={almacen}
                            productos={productos}
                            isLoading={productosLoading}
                            isError={productosError}
                        />

                        <SelectorAlmacen
                            almacen={almacen}
                            setAlmacen={setAlmacen}
                        />
                    </div>

                    <TicketProductos
                        productos={mesa?.productos}
                        recargas={mesa?.recargas}
                        chance={mesa?.chance}
                        onEditarProducto={editarProducto}
                        onEditarDistinto={editarDistinto}
                        formatearPrecio={formatearPrecio}
                    />
                </section>

                <section className={styles.acciones}>
                    <MesasPanel
                        mesas={mesasFiltradas}
                        mesaActiva={mesaActiva}
                        cambiarMesa={cambiarMesa}
                        onNuevaMesa={crearMesa}
                    />

                    <AccionesMesa
                        onCerrarVenta={() => {
                            setTipoCierre("venta");
                            setOpenCerrarMesa(true);
                        }}
                        onCerrarDeuda={() => {
                            setTipoCierre("deuda");
                            setOpenCerrarMesa(true);
                        }}
                        onRecarga={() => {
                            setTipoDistinto("recarga");
                            setOpenDistinto(true);
                        }}
                        onChance={() => {
                            setTipoDistinto("chance");
                            setOpenDistinto(true);
                        }}
                        onConsultarProducto={() => setOpenProducto(true)}
                    />
                </section>
            </main>

            {/* FOOTER */}
            <PosFooter
                total={formatearPrecio(total)}
                cantidadItems={cantidadItems}
                productos={formatearPrecio(totalProductos)}
                recargas={formatearPrecio(totalRecargas)}
                chance={formatearPrecio(totalChance)}
            />

            {/* MODALES */}
            <ModalCerrarMesa
                ref={confirmarCerrarMesaRef}
                open={openCerrarMesa}
                tipo={tipoCierre}
                total={mesa?.total || 0}
                onClose={() => setOpenCerrarMesa(false)}
                onConfirm={(payload) => {
                    cerrarMesa(payload);
                    setOpenCerrarMesa(false);
                }}
                formatearPrecio={formatearPrecio}
                metodosPago={metodosPagoQuery}
                usuarios={usuarios}
            />

            <ModalDistinto
                ref={confirmarDistintoRef}
                open={openDistinto}
                tipo={tipoDistinto}
                onClose={() => setOpenDistinto(false)}
                onConfirm={(valor) => {
                    agregarDistinto(tipoDistinto, valor);
                    setOpenDistinto(false);
                }}
            />

            <ModalProducto
                open={openProducto}
                productos={productosSinFiltro}
                onClose={() => setOpenProducto(false)}
                formatearPrecio={formatearPrecio}
            />
        </div>
    );
}
