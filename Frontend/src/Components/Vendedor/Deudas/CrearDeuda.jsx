import styles from "../../../assets/Css/index.module.scss";
import stylesDeuda from "../../../assets/Css/deuda.module.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import { useCrearDeuda } from "../../../Hooks/Vendedor/Deudas/useCrearDeuda";

export default function CrearDeuda() {
    const navigate = useNavigate();
    const { mutate, isPending, isError, error, isSuccess } = useCrearDeuda();

    const [form, setForm] = useState({
        id_usuario: "",
        total: "",
        estado: "pendiente",
        observaciones: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // convertir a número
        const payload = {
            ...form,
            id_usuario: parseInt(form.id_usuario, 10),
            total: parseFloat(form.total),
        };

        mutate(payload, {
            onSuccess: () => {
                Swal.fire({
                    icon: "success",
                    title: "Deuda creada con éxito ✅",
                    confirmButtonColor: "#3085d6",
                }).then(() => {
                    navigate("/deudas"); // ajusta ruta a la lista de deudas
                });
            },
            onError: () => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo crear la deuda. Inténtalo de nuevo.",
                    confirmButtonColor: "#d33",
                });
            },
        });
    };

    return (
        <main className={`${styles.Container} ${stylesDeuda.Container}`}>
            {/* Botón volver */}
            <div className="volver">
                <button onClick={() => navigate(-1)} className={stylesDeuda.BotonVolver}>
                    <i className="bx bx-arrow-back"></i>
                    Volver
                </button>
            </div>

            <h2>Crear Deuda</h2>

            <form onSubmit={handleSubmit} className={stylesDeuda.Form}>
                <div className={stylesDeuda.InputGroup}>
                    <label>ID Usuario</label>
                    <input
                        type="number"
                        name="id_usuario"
                        value={form.id_usuario}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={stylesDeuda.InputGroup}>
                    <label>Total</label>
                    <input
                        type="number"
                        step="0.01"
                        name="total"
                        value={form.total}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={stylesDeuda.InputGroup}>
                    <label>Estado</label>
                    <select
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                    >
                        <option value="pendiente">Pendiente</option>
                        <option value="pagada">Pagada</option>
                        <option value="parcial">Parcial</option>
                    </select>
                </div>

                <div className={stylesDeuda.InputGroup}>
                    <label>Observaciones</label>
                    <textarea
                        name="observaciones"
                        value={form.observaciones}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className={stylesDeuda.BotonSubmit} disabled={isPending}>
                    {isPending ? "Creando..." : "Crear"}
                </button>
            </form>

            {isError && (
                <p className={stylesDeuda.ErrorMsg}>{error.message}</p>
            )}
            {isSuccess && (
                <p className={stylesDeuda.SuccessMsg}>✅ Deuda creada</p>
            )}
        </main>
    );
}
