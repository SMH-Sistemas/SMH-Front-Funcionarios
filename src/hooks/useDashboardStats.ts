import { useQuery } from "@tanstack/react-query";
import { apiProductService } from "@/services/api.product";
import { productKeys } from "./useProducts";
import { useIsAuthenticated } from "@/hooks/useAuth";

export const useDashboardStats = () => {
  const { isAuthenticated } = useIsAuthenticated();

  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: async () => {
      const response = await apiProductService.getDashboardStats();
      return response.data;
    },
    enabled: isAuthenticated, // Só executa se o usuário estiver autenticado
    retry: false,
    // Refetch a cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
  });
};
