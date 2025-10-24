// src/hooks/useCustomers.ts
import { useQuery } from "@tanstack/react-query";
import apiCustomerService, { type CustomerDTO } from "@/services/api.customer";

// Keys para o React Query
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Hook para buscar todos os clientes
export const useCustomers = () => {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: async () => {
      const response = await apiCustomerService.getAllCustomers();
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
};

// Hook para buscar cliente por ID
export const useCustomer = (customerId: string | null) => {
  return useQuery({
    queryKey: customerKeys.detail(customerId || ""),
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID is required");
      const response = await apiCustomerService.getCustomerById(customerId);
      return response.data;
    },
    enabled: !!customerId,
  });
};
