// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiOrderService, {
  type OrderResponseDTO,
  type OrderRequestDTO,
} from "@/services/api.order";
import { toast } from "sonner";

// Keys para o React Query
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: string) => [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  byCustomer: (customerId: string) =>
    [...orderKeys.all, "customer", customerId] as const,
};

// Hook para buscar todos os pedidos
export const useOrders = () => {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      const response = await apiOrderService.getAllOrders();
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
};

// Hook para buscar pedido por ID
export const useOrder = (orderId: number | null) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId?.toString() || ""),
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      const response = await apiOrderService.getOrderById(orderId);
      return response.data;
    },
    enabled: !!orderId,
  });
};

// Hook para buscar pedidos de um cliente
export const useOrdersByCustomer = (customerId: string | null) => {
  return useQuery({
    queryKey: orderKeys.byCustomer(customerId || ""),
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID is required");
      const response = await apiOrderService.getOrdersByCustomer(customerId);
      return response.data;
    },
    enabled: !!customerId,
  });
};

// Hook para criar pedido
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: OrderRequestDTO) => {
      const response = await apiOrderService.createOrder(orderData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success("Pedido criado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar pedido:", error);
      toast.error("Erro ao criar pedido. Tente novamente.");
    },
  });
};

// Hook para atualizar status do pedido
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: number;
      status: string;
    }) => {
      const response = await apiOrderService.updateOrderStatus(orderId, status);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(orderKeys.detail(data.id.toString()), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status. Tente novamente.");
    },
  });
};

// Hook para deletar pedido
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      await apiOrderService.deleteOrder(orderId);
      return orderId;
    },
    onSuccess: (orderId) => {
      queryClient.removeQueries({
        queryKey: orderKeys.detail(orderId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success("Pedido deletado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao deletar pedido:", error);
      toast.error("Erro ao deletar pedido. Tente novamente.");
    },
  });
};

// Hook para enviar email do pedido
export const useSendOrderEmail = () => {
  return useMutation({
    mutationFn: async ({
      orderId,
      emailData,
    }: {
      orderId: number;
      emailData: { to: string; subject: string; body: string };
    }) => {
      const response = await apiOrderService.sendOrderEmail(orderId, emailData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Email enviado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao enviar email:", error);
      toast.error(error?.message || "Erro ao enviar email. Tente novamente.");
    },
  });
};
