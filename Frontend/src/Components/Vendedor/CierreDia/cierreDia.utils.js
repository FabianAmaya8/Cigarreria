const moneyFormatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

export function formatMoney(value) {
    return moneyFormatter.format(Number(value || 0));
}

export function getTodayLocalISO() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function formatDate(value) {
    if (!value) return "Sin fecha";

    return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export function clampPercent(value) {
    if (Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(100, value));
}

export function detactarEstadoCierre(totalCierre, totalAsignado, totalDisponible){
    const estado = totalCierre <= 0
        ? "Sin datos"
        : totalDisponible <= 0
        ? "Distribución completa"
        : totalAsignado <= 0
        ? "Pendiente"
        : "En progreso"

    const title = totalCierre <= 0
        ? "Sin datos"
        : totalDisponible <= 0
        ? "Distribución completa"
        : totalAsignado <= 0
        ? "Pendiente"
        : "En progreso"

    return {
        estado,
        title
    }
}