export function formatMoney(value) {
    const numeric = Number(value || 0);
    return `$ ${numeric.toLocaleString("es-CO", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

export function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-CO");
}

export function getEntityName(entity, fallback = "Sin nombre") {
    return (
        entity?.nombre ||
        entity?.nombre_caja ||
        entity?.nombre_bolsillo ||
        entity?.descripcion ||
        entity?.caja ||
        entity?.bolsillo ||
        fallback
    );
}

export function getEntityId(entity, kind) {
    if (!entity) return "";
    if (kind === "caja") return entity.id_caja ?? entity.id ?? "";
    if (kind === "bolsillo") return entity.id_bolsillo ?? entity.id ?? "";
    return entity.id ?? "";
}

export function getProveedorNombre(compra) {
    if (!compra) return "—";
    if (typeof compra.proveedor === "string") return compra.proveedor;
    return compra.proveedor?.nombre || "—";
}
