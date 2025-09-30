import { useEstadisticas } from "../../Hooks/Vendedor/useEstadisticas";
import styles from "../../assets/Css/index.module.scss";
import stylesEstadisticas from "../../assets/Css/Estadisticas.module.scss";
import { Hourglass } from "ldrs/react";
import { Bar, PolarArea } from "react-chartjs-2";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    RadialLinearScale
} from "chart.js";

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    RadialLinearScale
);

const Estadisticas = ({ limit = 15 }) => {
    const { masVendidos, menosVendidos, masIngresos, menosStock, loading, error } = useEstadisticas(limit);

    // Gráfico: Productos más vendidos
    const dataMasVendidos = {
        labels: masVendidos.map((p) => p.nombre),
        datasets: [
            {
                label: "Cantidad vendida",
                data: masVendidos.map((p) => p.total_vendido),
                backgroundColor: "#36A2EB",
            },
        ],
    };

    // Gráfico: Productos menos vendidos
    const dataMenosVendidos = {
        labels: menosVendidos.map((p) => p.nombre),
        datasets: [
            {
                label: "Cantidad vendida",
                data: menosVendidos.map((p) => p.total_vendido),
                backgroundColor: "#36A2EB",
            },
        ],
    };

    // Gráfico: Productos con más ingresos
    const dataMasIngresos = {
        labels: masIngresos.map((p) => p.nombre),
        datasets: [
            {
                label: "Ingresos ($)",
                data: masIngresos.map((p) => p.ingresos),
                backgroundColor: [
                    "#FFCE5655", "#4BC0C055", "#9966FF55",
                    "#FF9F4055", "#C9CBCF55", "#36A2EB55",
                    "#FF638455", "#FF7F5055", "#FFCE5655",
                    "#4BC0C055", "#9966FF55", "#FF9F4055",
                    "#C9CBCF55", "#36A2EB55", "#FF638455",
                ],
            },
        ],
    };

    return (
        <main className={`${styles.Container} ${stylesEstadisticas.estadisticas}`}>
            <h2>📊 Estadísticas</h2>

            {/* Gráfico más vendidos */}
            <div className={stylesEstadisticas.chartContainer}>
                <h3>Productos más vendidos</h3>
                {loading.masVendidos ? (
                    <Hourglass size={80} speed={1} color="var(--azul-500)" />
                ) : error.masVendidos ? (
                    <div className="alert alert-danger">Error: {error.masVendidos}</div>
                ) : (
                    <Bar data={dataMasVendidos} />
                )}
            </div>

            {/* Gráfico menos vendidos */}
            <div className={stylesEstadisticas.chartContainer}>
                <h3>Productos menos vendidos</h3>
                {loading.menosVendidos ? (
                    <Hourglass size={80} speed={1} color="var(--azul-500)" />
                ) : error.menosVendidos ? (
                    <div className="alert alert-danger">Error: {error.menosVendidos}</div>
                ) : (
                    <Bar data={dataMenosVendidos} />
                )}
            </div>

            {/* Gráfico más ingresos */}
            <div className={stylesEstadisticas.chartContainer}>
                <h3>Productos con más ingresos</h3>
                {loading.masIngresos ? (
                    <Hourglass size={80} speed={1} color="var(--azul-500)" />
                ) : error.masIngresos ? (
                    <div className="alert alert-danger">Error: {error.masIngresos}</div>
                ) : (
                    <PolarArea data={dataMasIngresos} />
                )}
            </div>

            {/* Tabla de productos con menos stock */}
            <div className={stylesEstadisticas.tableContainer}>
                <h3>📉 Productos con menos stock</h3>
                {loading.menosStock ? (
                    <Hourglass size={80} speed={1} color="var(--azul-500)" />
                ) : error.menosStock ? (
                    <div className="alert alert-danger">Error: {error.menosStock}</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Producto</th>
                                    <th scope="col">Stock actual</th>
                                    <th scope="col">Stock mínimo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menosStock.map((p, index) => (
                                    <tr key={p.id_producto}>
                                        <td>{index + 1}</td>
                                        <td>{p.nombre}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    p.stock_actual <= p.stock_minimo
                                                        ? stylesEstadisticas["badge-danger"]
                                                        : stylesEstadisticas["badge-success"]
                                                }`}
                                            >
                                                {p.stock_actual}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${stylesEstadisticas["badge-secondary"]}`}>
                                                {p.stock_minimo}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Estadisticas;