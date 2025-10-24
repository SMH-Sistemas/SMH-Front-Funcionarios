// src/services/api.order.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import apiAuthService from "./api.auth";
import {
  ApiResponse,
  ErrorResponse,
  extractErrorMessage,
} from "@/types/api.types";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/api/v1";

// Enums
export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

// DTOs de Response
export interface CustomerSummaryDTO {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface EmployeeSummaryDTO {
  id: string;
  name: string;
  email: string;
}

export interface AddressResponseDTO {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  cep: string;
}

export interface TransportInfoResponseDTO {
  carrierName: string;
  trackingCode: string;
  expectedDeliveryDate: string; // LocalDate ISO format
}

export interface OrderItemResponseDTO {
  id: number;
  productNcm: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxValue: number;
  subtotal: number;
}

export interface OrderResponseDTO {
  id: number;
  orderNumber: string;
  orderStatus: OrderStatus;
  status: string;
  totalAmount: number;
  createdAtUtc: string; // Instant ISO format
  clientTimezone: string;
  clientLocalTime: string; // LocalDateTime ISO format
  customer: CustomerSummaryDTO;
  employee: EmployeeSummaryDTO;
  deliveryAddress: AddressResponseDTO;
  transportInfo: TransportInfoResponseDTO;
  items: OrderItemResponseDTO[];
}

// DTOs de Request
export interface ProductRequestDTO {
  productId?: number;
  name: string;
  imgUrl?: string;
  description?: string;
  ncm: string;
  stockQuantity: number;
  cost: number;
  profitMargin: number;
  price: number;
  category: string;
  type: string;
  status: string; // Valores aceitos: RESERVED, AVAILABLE, SOLD, OUT_OF_STOCK, DISCONTINUED
}

export interface CustomerRequestDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  fiscalIdentification: string;
  phoneNumber: string;
}

export interface EmployeeRequestDTO {
  name: string;
  surname: string;
  email: string;
  password: string;
  commissionBalance: number; // Saldo de comissão do vendedor
  phoneNumber: string;
}

export interface AddressRequestDTO {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  cep: string;
}

export interface TransportInfoRequestDTO {
  carrierName: string;
  trackingCode: string;
  expectedDeliveryDate: string; // LocalDate ISO format (YYYY-MM-DD)
}

export interface OrderItemRequestDTO {
  product: ProductRequestDTO;
  quantity: number;
  taxId?: number | null; // ID do imposto do item (se aplicável)
}

export interface OrderRequestDTO {
  customer: CustomerRequestDTO; // Dados completos do cliente
  employee: EmployeeRequestDTO; // Dados completos do vendedor
  clientTimezone: string;
  orderStatus?: string; // Status inicial do pedido: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
  taxId: number | null; // ID do imposto global do pedido
  deliveryAddress: AddressRequestDTO;
  transportInfo: TransportInfoRequestDTO;
  items: OrderItemRequestDTO[];
}

class ApiOrderService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true, // envia cookies httpOnly
      timeout: 10000, // Timeout de 10 segundos
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para requisições
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Cookies HttpOnly são enviados automaticamente pelo navegador
        // Não precisamos adicionar Authorization header manualmente
        console.log(
          `[API Order] ${config.method?.toUpperCase()} ${config.baseURL}${
            config.url
          } (cookies HttpOnly gerenciados automaticamente)`
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para respostas
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`[API Order] Response ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Se 401, tentar refresh e refazer a requisição (uma vez)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log(
            "[API Order] 🔄 Token expirado, renovando automaticamente..."
          );

          try {
            await apiAuthService.refreshToken();
            console.log(
              "[API Order] ✅ Token renovado com sucesso, refazendo requisição"
            );
            // Refazer a requisição original com o novo token (em cookies)
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error(
              "[API Order] ❌ Falha ao renovar token, redirecionando para login"
            );
            // Se o refresh falhar, redirecionar para login será feito pelo ProtectedRoute
            return Promise.reject(error);
          }
        }

        // Extrair mensagem de erro do formato ErrorResponse do backend
        let errorMessage: string;

        if (error.response?.data) {
          // Backend retorna: ErrorResponse { timestamp, status, error, message, path }
          errorMessage = extractErrorMessage(error.response.data);
        } else if (error.request) {
          errorMessage = "Sem resposta do servidor";
        } else {
          errorMessage = error.message || "Erro ao processar requisição";
        }

        console.error(`[API Order] Erro: ${errorMessage}`);
        if (error.response?.data) {
          console.error(
            "[API Order] Detalhes:",
            error.response.data as ErrorResponse
          );
        }

        const customError = new Error(errorMessage);
        (customError as any).status = error.response?.status;
        (customError as any).errorData = error.response?.data as
          | ErrorResponse
          | undefined;
        return Promise.reject(customError);
      }
    );
  }

  private async request<T>(
    endpoint: string,
    method: string = "GET",
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request({
        url: endpoint,
        method,
        data,
      });

      return { data: response.data, success: true };
    } catch (error) {
      throw error;
    }
  }

  // Endpoints de Orders

  async createOrder(
    orderData: OrderRequestDTO
  ): Promise<ApiResponse<OrderResponseDTO>> {
    return this.request<OrderResponseDTO>("/orders", "POST", orderData);
  }

  async getAllOrders(): Promise<ApiResponse<OrderResponseDTO[]>> {
    return this.request<OrderResponseDTO[]>("/orders", "GET");
  }

  async getOrderById(orderId: number): Promise<ApiResponse<OrderResponseDTO>> {
    return this.request<OrderResponseDTO>(`/orders/${orderId}`, "GET");
  }

  async updateOrderStatus(
    orderId: number,
    status: string
  ): Promise<ApiResponse<OrderResponseDTO>> {
    return this.request<OrderResponseDTO>(
      `/orders/${orderId}/status?status=${status}`,
      "PATCH"
    );
  }

  async deleteOrder(orderId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/orders/${orderId}`, "DELETE");
  }

  async getOrdersByCustomer(
    customerId: string
  ): Promise<ApiResponse<OrderResponseDTO[]>> {
    return this.request<OrderResponseDTO[]>(
      `/orders/customer/${customerId}`,
      "GET"
    );
  }

  async sendOrderEmail(
    orderId: number,
    emailData: {
      to: string;
      subject: string;
      body: string;
    }
  ): Promise<ApiResponse<void>> {
    return this.request<void>(
      `/orders/send-email/${orderId}`,
      "POST",
      emailData
    );
  }
}

export const apiOrderService = new ApiOrderService();
export default apiOrderService;
