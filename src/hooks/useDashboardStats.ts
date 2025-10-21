import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { productKeys } from "./useProducts";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: async () => {
      const response = await apiService.getDashboardStats();
      return response.data;
    },
    // Refetch a cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
  });
};
