import { useQuery } from "@tanstack/react-query";
import { fetchMesasAbiertas } from "../services/pos.service";

export default function useMesas() {
    return useQuery({
        queryKey: ["mesas"],
        queryFn: fetchMesasAbiertas,
        refetchInterval: 300000,
    });
}
