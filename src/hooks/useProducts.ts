import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiService,
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
} from "@/services/api";
import { toast } from "sonner";

// Query Keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  stats: () => [...productKeys.all, "stats"] as const,
};

// Hook para buscar todos os produtos
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const response = await apiService.getProducts();
      return response.data;
    },
  });
};

// Hook para buscar um produto específico
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await apiService.getProduct(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para criar produto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: CreateProductRequest) => {
      const response = await apiService.createProduct(product);
      return response.data;
    },
    onSuccess: (newProduct) => {
      // Invalidar e refetch da lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success("Produto criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar produto:", error);
      toast.error("Erro ao criar produto. Tente novamente.");
    },
  });
};

// Hook para atualizar produto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: UpdateProductRequest) => {
      const response = await apiService.updateProduct(product);
      return response.data;
    },
    onSuccess: (updatedProduct) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(updatedProduct.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar produto:", error);
      toast.error("Erro ao atualizar produto. Tente novamente.");
    },
  });
};

// Hook para deletar produto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiService.deleteProduct(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remover o produto do cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success("Produto removido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao deletar produto:", error);
      toast.error("Erro ao remover produto. Tente novamente.");
    },
  });
};

// Hook para aplicar desconto
export const useApplyDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productIds,
      discount,
    }: {
      productIds: string[];
      discount: number;
    }) => {
      const response = await apiService.applyDiscount(productIds, discount);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });

      toast.success("Desconto aplicado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao aplicar desconto:", error);
      toast.error("Erro ao aplicar desconto. Tente novamente.");
    },
  });
};
