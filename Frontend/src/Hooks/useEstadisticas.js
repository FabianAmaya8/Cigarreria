import { useEffect, useState } from "react";
import { findWorkingBaseUrl } from "../urlDB";

export function useEstadisticas(limit = 3) {
    const [masVendidos, setMasVendidos] = useState([]);
    const [menosVendidos, setMenosVendidos] = useState([]);
    const [masIngresos, setMasIngresos] = useState([]);
    const [menosStock, setMenosStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const urlDB = findWorkingBaseUrl();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoints = [
                    `${urlDB}api/estadisticas/mas_vendidos?limit=${limit}`,
                    `${urlDB}api/estadisticas/menos_vendidos?limit=${limit}`,
                    `${urlDB}api/estadisticas/mas_ingresos?limit=${limit}`,
                    `${urlDB}api/estadisticas/menos_stock?limit=${limit}`,
                ];

                const [masVendidosRes, menosVendidosRes, masIngresosRes , menosStockRes] = await Promise.all(
                    endpoints.map((url) => fetch(url).then((res) => res.json()))
                );

                setMasVendidos(masVendidosRes);
                setMenosVendidos(menosVendidosRes);
                setMasIngresos(masIngresosRes);
                setMenosStock(menosStockRes);
                
            } catch (err) {
                setError("Error cargando estadísticas");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [limit]);

    return { masVendidos, menosVendidos, masIngresos, menosStock , loading, error };
}
