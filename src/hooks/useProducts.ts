import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiProductService,
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
} from "@/services/api.product";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { toast } from "sonner";
import { lpuKeys } from "@/hooks/useLPUs";

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
  const { isAuthenticated } = useIsAuthenticated();

  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const response = await apiProductService.getProducts();
      return response.data;
    },
    enabled: isAuthenticated, // Só executa se o usuário estiver autenticado
    retry: false,
  });
};

// Hook para buscar um produto específico
export const useProduct = (id: number) => {
  return useQuery({
    queryKey: productKeys.detail(id.toString()),
    queryFn: async () => {
      const response = await apiProductService.getProduct(id);
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
      const response = await apiProductService.createProduct(product);
      return response.data;
    },
    onSuccess: (newProduct) => {
      // Invalidar e refetch da lista de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      // Invalidar LPUs para atualizar contadores e listas
      queryClient.invalidateQueries({ queryKey: lpuKeys.all });

      toast.success("Produto criado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar produto:", error);
      const errorMessage =
        error?.message || "Erro ao criar produto. Tente novamente.";
      toast.error(errorMessage);
    },
  });
};

// Hook para atualizar produto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: UpdateProductRequest) => {
      const { id, ...productData } = product;
      const response = await apiProductService.updateProduct(id, productData);
      return response.data;
    },
    onSuccess: (updatedProduct) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(updatedProduct.id.toString()),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      // Invalidar LPUs para atualizar produtos nas LPUs
      queryClient.invalidateQueries({ queryKey: lpuKeys.all });

      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar produto:", error);
      const errorMessage =
        error?.message || "Erro ao atualizar produto. Tente novamente.";
      toast.error(errorMessage);
    },
  });
};

// Hook para deletar produto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiProductService.deleteProduct(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remover o produto do cache
      queryClient.removeQueries({
        queryKey: productKeys.detail(deletedId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      // Invalidar LPUs para atualizar listas
      queryClient.invalidateQueries({ queryKey: lpuKeys.all });

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
      discountPercentage,
    }: {
      productIds: number[];
      discountPercentage: number;
    }) => {
      const response = await apiProductService.applyDiscount(
        productIds,
        discountPercentage
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      // Invalidar LPUs para atualizar preços dos produtos
      queryClient.invalidateQueries({ queryKey: lpuKeys.all });

      toast.success("Desconto aplicado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao aplicar desconto:", error);
      toast.error("Erro ao aplicar desconto. Tente novamente.");
    },
  });
};

// Hook para reverter desconto
export const useRevertDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productIds: number[]) => {
      const response = await apiProductService.revertDiscount(productIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      // Invalidar LPUs para atualizar preços dos produtos
      queryClient.invalidateQueries({ queryKey: lpuKeys.all });

      toast.success("Desconto revertido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao reverter desconto:", error);
      toast.error("Erro ao reverter desconto. Tente novamente.");
    },
  });
};

// Hook para aumentar preço
export const useIncreasePrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productIds,
      increasePercentage,
    }: {
      productIds: number[];
      increasePercentage: number;
    }) => {
      const response = await apiProductService.increasePrice(
        productIds,
        increasePercentage
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.stats() });
      // Invalidar LPUs para atualizar preços dos produtos
      queryClient.invalidateQueries({ queryKey: lpuKeys.all });

      toast.success("Preços aumentados com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao aumentar preços:", error);
      toast.error("Erro ao aumentar preços. Tente novamente.");
    },
  });
};
