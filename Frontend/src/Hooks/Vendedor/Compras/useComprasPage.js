import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
    useActualizarCompra,
    useAbonarCompensacion,
    useAlertasCompra,
    useBolsillosCompra,
    useCajasCompra,
    useCompra,
    useCompras,
    useCompensacionesPendientes,
    useCrearCompra,
    useCrearCompensacion,
    useProductosCompra,
    useRecibirCompra,
    useRegistrarDevolucionCompra,
    useRegistrarPagoCompra,
} from "./useCompras";
import { useProveedores } from "../Proveedores/useProveedores";
import { getProveedorNombre } from "../../../Utils/comprasFormatters";

export function useComprasPage() {
    const [busqueda, setBusqueda] = useState("");
    const [idProveedor, setIdProveedor] = useState("");
    const [estadoPago, setEstadoPago] = useState("");
    const [estadoRecepcion, setEstadoRecepcion] = useState("");

    const [openForm, setOpenForm] = useState(false);
    const [modoForm, setModoForm] = useState("create");
    const [compraEditar, setCompraEditar] = useState(null);
    const [compraDetalleId, setCompraDetalleId] = useState(null);
    const [compraRecepcion, setCompraRecepcion] = useState(null);
    const [compraPago, setCompraPago] = useState(null);
    const [compraDevolucion, setCompraDevolucion] = useState(null);
    const [openCompensacion, setOpenCompensacion] = useState(false);
    const [compensacionAbono, setCompensacionAbono] = useState(null);

    const filtros = useMemo(
        () => ({
            id_proveedor: idProveedor || undefined,
            estado_pago: estadoPago || undefined,
            estado_recepcion: estadoRecepcion || undefined,
        }),
        [idProveedor, estadoPago, estadoRecepcion],
    );

    const comprasQuery = useCompras(filtros);
    const { data: proveedores } = useProveedores({});
    const { data: productos } = useProductosCompra();
    const { data: cajas } = useCajasCompra();
    const { data: bolsillos } = useBolsillosCompra();
    const { data: compensacionesPendientes } = useCompensacionesPendientes();

    const compraDetalleQuery = useCompra(
        compraDetalleId,
        Boolean(compraDetalleId),
    );
    const alertasQuery = useAlertasCompra(
        compraDetalleId,
        Boolean(compraDetalleId),
    );

    const crearCompra = useCrearCompra();
    const actualizarCompra = useActualizarCompra();
    const recibirCompra = useRecibirCompra();
    const registrarPagoCompra = useRegistrarPagoCompra();
    const registrarDevolucionCompra = useRegistrarDevolucionCompra();
    const crearCompensacion = useCrearCompensacion();
    const abonarCompensacion = useAbonarCompensacion();

    const compras = comprasQuery.data || [];

    const compraDetalle =
        compraDetalleQuery.data ||
        compras.find((item) => item.id_compra === compraDetalleId) ||
        null;

    const comprasFiltradas = useMemo(() => {
        const term = busqueda.trim().toLowerCase();

        return compras.filter(
            (compra) =>
                !term ||
                String(compra.numero_factura || "")
                    .toLowerCase()
                    .includes(term) ||
                String(compra.id_compra).includes(term) ||
                getProveedorNombre(compra).toLowerCase().includes(term),
        );
    }, [compras, busqueda]);

    const stats = useMemo(
        () => ({
            total: compras.length,
            pendientesPago: compras.filter(
                (item) => item.estado_pago !== "pagada",
            ).length,
            pendientesRecepcion: compras.filter(
                (item) => item.estado_recepcion === "pendiente",
            ).length,
            saldoPendiente: compras.reduce(
                (acc, item) => acc + Number(item.saldo_pendiente || 0),
                0,
            ),
        }),
        [compras],
    );

    const success = (title, text) => Swal.fire(title, text, "success");

    const handleCrearCompra = async (payload) => {
        await crearCompra.mutateAsync(payload);
        await success("Compra creada", "La orden fue registrada correctamente.");
    };

    const handleActualizarCompra = async (payload) => {
        await actualizarCompra.mutateAsync({
            idCompra: compraEditar.id_compra,
            data: payload,
        });
        await success("Compra actualizada", "Los datos generales fueron actualizados.");
    };

    const handleRecepcion = async (payload) => {
        await recibirCompra.mutateAsync({
            idCompra: compraRecepcion.id_compra,
            data: payload,
        });
        await success("Recepción registrada", "La compra fue recibida correctamente.");
    };

    const handlePago = async (payload) => {
        await registrarPagoCompra.mutateAsync({
            idCompra: compraPago.id_compra,
            data: payload,
        });
        await success("Pago registrado", "El pago quedó guardado.");
    };

    const handleDevolucion = async (payload) => {
        await registrarDevolucionCompra.mutateAsync({
            idCompra: compraDevolucion.id_compra,
            data: payload,
        });
        await success("Devolución registrada", "La devolución quedó guardada.");
    };

    const handleCompensacion = async (payload) => {
        await crearCompensacion.mutateAsync(payload);
        await success("Compensación creada", "La compensación quedó registrada.");
    };

    const handleAbono = async (payload) => {
        await abonarCompensacion.mutateAsync(payload);
        await success("Abono registrado", "La compensación fue abonada.");
    };

    const openCreate = () => {
        setModoForm("create");
        setCompraEditar(null);
        setOpenForm(true);
    };

    const openEdit = (compra) => {
        setModoForm("edit");
        setCompraEditar(compra);
        setOpenForm(true);
    };

    const closeForm = () => {
        setOpenForm(false);
        setCompraEditar(null);
    };

    return {
        busqueda, setBusqueda,
        idProveedor, setIdProveedor,
        estadoPago, setEstadoPago,
        estadoRecepcion, setEstadoRecepcion,
        openForm, modoForm, compraEditar,
        compraDetalleId, setCompraDetalleId,
        compraRecepcion, setCompraRecepcion,
        compraPago, setCompraPago,
        compraDevolucion, setCompraDevolucion,
        openCompensacion, setOpenCompensacion,
        compensacionAbono, setCompensacionAbono,
        comprasFiltradas, stats, proveedores, productos, cajas, bolsillos,
        compensacionesPendientes, compraDetalle, alertas: alertasQuery.data || [],
        isLoading: comprasQuery.isLoading,
        error: comprasQuery.error,
        openCreate, openEdit, closeForm,
        handleCrearCompra, handleActualizarCompra, handleRecepcion,
        handlePago, handleDevolucion, handleCompensacion, handleAbono,
        isCreating: crearCompra.isPending,
        isUpdating: actualizarCompra.isPending,
        isReceiving: recibirCompra.isPending,
        isPaying: registrarPagoCompra.isPending,
        isReturning: registrarDevolucionCompra.isPending,
        isCompensating: crearCompensacion.isPending,
        isAbonando: abonarCompensacion.isPending,
    };
}
