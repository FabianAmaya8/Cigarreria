export function calcularTotales(mesa) {
    if (!mesa) {
        return {
            productos: 0,
            recargas: 0,
            chance: 0,
            total: 0,
            cantidadItems: 0,
        };
    }

    const productos = (mesa.productos || []).reduce(
        (acc, p) => acc + Number(p.subtotal || 0),
        0
    );

    const recargas = (mesa.recargas || []).reduce(
        (acc, r) => acc + Number(r.valor || 0),
        0
    );

    const chance = (mesa.chance || []).reduce(
        (acc, c) => acc + Number(c.valor || 0),
        0
    );

    const cantidadItems =
        (mesa.productos?.length || 0) +
        (mesa.recargas?.length || 0) +
        (mesa.chance?.length || 0);

    const total = productos + recargas + chance;

    return {
        productos,
        recargas,
        chance,
        total,
        cantidadItems,
    };
}
