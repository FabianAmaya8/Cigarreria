import { urlDB } from "../../../urlDB";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

// =======================
// MESAS
// =======================
export async function fetchMesa(idMesa) {
    const url = await urlDB(`/api/pos/mesas/${idMesa}`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al obtener mesa");
    return res.json();
}

export async function fetchMesasAbiertas() {
    const url = await urlDB(`/api/pos/mesas`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al listar mesas");
    return res.json();
}

// =======================
// PRODUCTOS
// =======================
export async function agregarProductoMesa(idMesa, payload) {
    const url = await urlDB(`/api/pos/mesas/${idMesa}/agregar`);
    const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function editarProductoMesa(idMesa, payload) {
    const url = await urlDB(`/api/pos/mesas/${idMesa}/editar`);
    const res = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

// =======================
// RECARGA / CHANCE
// =======================
export async function agregarRecarga(idMesa, valor) {
    const url = await urlDB(`/api/pos/mesas/${idMesa}/recarga`);
    const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ valor }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function agregarChance(idMesa, valor) {
    const url = await urlDB(`/api/pos/mesas/${idMesa}/chance`);
    const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ valor }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

export async function editarDistintoMesa(idMesa, payload) {
    const url = await urlDB(`/api/pos/mesas/${idMesa}/editar-distinto`);
    const res = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

// =======================
// CIERRE
// =======================
export async function cerrarMesa(idMesa, payload) {
    const url = await urlDB(`/api/pos/mesas/${idMesa}/cerrar`);
    const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

// =======================
// ESCANEO
// =======================
export async function obtenerProductoPorCodigo(codigo) {
    const url = await urlDB(`/api/productos/codigo/${codigo}`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Producto no encontrado");
    return res.json();
}

// =======================
// LISTAR METODOS DE PAGO
// =======================
export async function fetchMetodosPago() {
    const url = await urlDB(`/api/pos/metodos-pago`);
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Error al listar metodos de pago");
    return res.json();
}