export function invalidateCierreDiaRelatedQueries(queryClient) {
    queryClient.invalidateQueries({ queryKey: ["cierre-dia"] });
    queryClient.invalidateQueries({ queryKey: ["bolsillos"] });
    queryClient.invalidateQueries({ queryKey: ["bolsillos-total"] });
    queryClient.invalidateQueries({ queryKey: ["bolsillos-movimientos"] });
}
