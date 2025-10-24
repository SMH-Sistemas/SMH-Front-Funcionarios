// src/hooks/useTaxes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiTaxService,
  TaxResponseDTO,
  TaxRequestDTO,
  TaxType,
} from "@/services/api.tax";
import { toast } from "sonner";

// Query keys
export const taxKeys = {
  all: ["taxes"] as const,
  lists: () => [...taxKeys.all, "list"] as const,
  list: (filters: string) => [...taxKeys.lists(), { filters }] as const,
  details: () => [...taxKeys.all, "detail"] as const,
  detail: (id: string) => [...taxKeys.details(), id] as const,
  byType: (type: TaxType) => [...taxKeys.all, "type", type] as const,
};

// Hook para buscar todos os impostos
export const useTaxes = () => {
  return useQuery({
    queryKey: taxKeys.lists(),
    queryFn: async () => {
      const response = await apiTaxService.getAllTaxes();
      return response.data;
    },
  });
};

// Hook para buscar um imposto por ID
export const useTax = (id: number) => {
  return useQuery({
    queryKey: taxKeys.detail(id.toString()),
    queryFn: async () => {
      const response = await apiTaxService.getTaxById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para buscar imposto por tipo
export const useTaxByType = (type: TaxType) => {
  return useQuery({
    queryKey: taxKeys.byType(type),
    queryFn: async () => {
      const response = await apiTaxService.getTaxByType(type);
      return response.data;
    },
    enabled: !!type,
  });
};

// Hook para criar imposto
export const useCreateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaxRequestDTO) => {
      const response = await apiTaxService.createTax(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success("Imposto criado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro ao criar imposto:", error);
      toast.error(error.message || "Erro ao criar imposto");
    },
  });
};

// Hook para atualizar imposto
export const useUpdateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TaxRequestDTO }) => {
      const response = await apiTaxService.updateTax(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(taxKeys.detail(data.id.toString()), data);
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success("Imposto atualizado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar imposto:", error);
      toast.error(error.message || "Erro ao atualizar imposto");
    },
  });
};

// Hook para deletar imposto
export const useDeleteTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiTaxService.deleteTax(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success("Imposto deletado com sucesso!");
    },
    onError: (error: Error) => {
      console.error("Erro ao deletar imposto:", error);
      toast.error(error.message || "Erro ao deletar imposto");
    },
  });
};
