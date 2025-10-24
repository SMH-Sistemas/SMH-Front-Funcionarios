// src/hooks/useLPUs.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiLPUService, {
  type LPUResponseDTO,
  type LPURequestDTO,
  type ProductRequestDTO,
} from "@/services/api.lpu";
import { toast } from "sonner";

// Keys para o React Query
export const lpuKeys = {
  all: ["lpus"] as const,
  lists: () => [...lpuKeys.all, "list"] as const,
  list: (filters: string) => [...lpuKeys.lists(), { filters }] as const,
  details: () => [...lpuKeys.all, "detail"] as const,
  detail: (id: string) => [...lpuKeys.details(), id] as const,
};

// Hook para buscar todas as LPUs
export const useLPUs = () => {
  return useQuery({
    queryKey: lpuKeys.lists(),
    queryFn: async () => {
      const response = await apiLPUService.getAllLPUs();
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
};

// Hook para buscar LPU por ID
export const useLPU = (lpuId: number | null) => {
  return useQuery({
    queryKey: lpuKeys.detail(lpuId?.toString() || ""),
    queryFn: async () => {
      if (!lpuId) throw new Error("LPU ID is required");
      const response = await apiLPUService.getLPUById(lpuId);
      return response.data;
    },
    enabled: !!lpuId,
  });
};

// Hook para criar LPU
export const useCreateLPU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lpuData: LPURequestDTO) => {
      const response = await apiLPUService.createLPU(lpuData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lpuKeys.lists() });
      toast.success("LPU criada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar LPU:", error);
      toast.error("Erro ao criar LPU. Tente novamente.");
    },
  });
};

// Hook para atualizar LPU
export const useUpdateLPU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LPURequestDTO }) => {
      const response = await apiLPUService.updateLPU(id, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(lpuKeys.detail(data.id.toString()), data);
      queryClient.invalidateQueries({ queryKey: lpuKeys.lists() });
      toast.success("LPU atualizada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar LPU:", error);
      toast.error("Erro ao atualizar LPU. Tente novamente.");
    },
  });
};

// Hook para deletar LPU
export const useDeleteLPU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiLPUService.deleteLPU(id);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.removeQueries({
        queryKey: lpuKeys.detail(deletedId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: lpuKeys.lists() });
      toast.success("LPU removida com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao deletar LPU:", error);
      toast.error("Erro ao remover LPU. Tente novamente.");
    },
  });
};

// Hook para adicionar produto(s) a uma LPU (existente ou novo)
export const useAddProductToLPU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lpuId,
      productIds,
      newProduct,
    }: {
      lpuId: number;
      productIds?: number[]; // IDs de produtos existentes
      newProduct?: ProductRequestDTO; // Novo produto a ser criado
    }) => {
      const response = await apiLPUService.addProductToLPU(lpuId, {
        productIds,
        newProduct,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Atualizar o cache da LPU específica
      queryClient.setQueryData(lpuKeys.detail(data.id.toString()), data);
      // Invalidar a LPU específica para forçar refetch
      queryClient.invalidateQueries({
        queryKey: lpuKeys.detail(data.id.toString()),
      });
      // Invalidar a lista de LPUs para atualizar contadores
      queryClient.invalidateQueries({ queryKey: lpuKeys.lists() });
      // Invalidar products para atualizar lista de produtos
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto adicionado à LPU com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao adicionar produto à LPU:", error);
      const errorMessage =
        error?.message || "Erro ao adicionar produto à LPU. Tente novamente.";
      toast.error(errorMessage);
    },
  });
};

// Hook para remover produto de uma LPU (via update da LPU)
export const useRemoveProductFromLPU = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lpuId,
      productId,
    }: {
      lpuId: number;
      productId: number;
    }) => {
      // Buscar LPU atual
      const currentLPU = queryClient.getQueryData<LPUResponseDTO>(
        lpuKeys.detail(lpuId.toString())
      );

      if (!currentLPU) {
        throw new Error("LPU não encontrada no cache");
      }

      // Criar lista atualizada de productIds (removendo o produto)
      const currentProductIds = currentLPU.products.map((p) => p.id);
      const updatedProductIds = currentProductIds.filter(
        (id) => id !== productId
      );

      // Atualizar LPU com nova lista de produtos
      const response = await apiLPUService.updateLPU(lpuId, {
        name: currentLPU.name,
        description: currentLPU.description,
        active: currentLPU.active,
        productIds: updatedProductIds,
      });

      return response.data;
    },
    onSuccess: (data) => {
      // Atualizar o cache da LPU específica
      queryClient.setQueryData(lpuKeys.detail(data.id.toString()), data);
      // Invalidar a LPU específica para forçar refetch
      queryClient.invalidateQueries({
        queryKey: lpuKeys.detail(data.id.toString()),
      });
      // Invalidar a lista de LPUs para atualizar contadores
      queryClient.invalidateQueries({ queryKey: lpuKeys.lists() });
      toast.success("Produto removido da LPU com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao remover produto da LPU:", error);
      toast.error("Erro ao remover produto. Tente novamente.");
    },
  });
};
