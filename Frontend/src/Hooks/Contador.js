import { useState, useEffect } from "react";

function useContador(timestampSegundos) {
  const [tiempoRestante, setTiempoRestante] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
    expirado: false,
    fechaObjetivo: null,
  });

  useEffect(() => {
    const fechaObjetivo = new Date(timestampSegundos * 1000);

    function calcularTiempo() {
      const ahora = new Date();
      const diferencia = fechaObjetivo - ahora;

      if (diferencia <= 0) {
        setTiempoRestante({
          dias: 0,
          horas: 0,
          minutos: 0,
          segundos: 0,
          expirado: true,
          fechaObjetivo,
        });
        return;
      }

      const segundos = Math.floor((diferencia / 1000) % 60);
      const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
      const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

      setTiempoRestante({
        dias,
        horas,
        minutos,
        segundos,
        expirado: false,
        fechaObjetivo,
      });
    }

    // calcular al inicio
    calcularTiempo();

    // actualizar cada minuto
    const intervalo = setInterval(calcularTiempo, 60_000);

    return () => clearInterval(intervalo);
  }, [timestampSegundos]);

  return tiempoRestante;
}

export default useContador;
