// Configuração base da API
import axios, { AxiosInstance, AxiosError } from "axios";
import apiAuthService from "./api.auth";
import {
  ApiResponse,
  ErrorResponse,
  extractErrorMessage,
} from "@/types/api.types";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/api/v1";

// Enums do backend
export enum ProductType {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
}

export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  DISCONTINUED = "DISCONTINUED",
}

// Corresponde ao ProductResponseDTO do backend
export interface Product {
  id: number;
  productId: number;
  name: string;
  imgUrl: string;
  description: string;
  stockQuantity: number;
  cost: number;
  profitMargin: number;
  category: string;
  ncm: string;
  price: number;
  unityPrice: string;
  type: ProductType;
  status: ProductStatus;
}

// Corresponde ao ProductRequestDTO do backend
export interface CreateProductRequest {
  productId?: number;
  name: string;
  imgUrl?: string;
  description: string;
  ncm: string;
  stockQuantity: number;
  cost: number;
  profitMargin: number;
  price: number;
  category: string;
  type: ProductType;
  status: ProductStatus;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

export interface PriceIncreaseRequest {
  productIds: number[];
  increasePercentage: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class ApiProductService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true, // envia cookies httpOnly
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
          `[API Product] ${config.method?.toUpperCase()} ${config.baseURL}${
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
        console.log(`[API Product] Response ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Se 401, tentar refresh e refazer a requisição (uma vez)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log(
            "[API Product] 🔄 Token expirado, renovando automaticamente..."
          );

          try {
            await apiAuthService.refreshToken();
            console.log(
              "[API Product] ✅ Token renovado com sucesso, refazendo requisição"
            );
            // Refazer a requisição original com o novo token (em cookies)
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error(
              "[API Product] ❌ Falha ao renovar token, redirecionando para login"
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

        console.error(`[API Product] Erro: ${errorMessage}`);
        if (error.response?.data) {
          console.error(
            "[API Product] Detalhes:",
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

      // Se o backend retornar o array/objeto diretamente, envolver em ApiResponse
      if (!response.data.hasOwnProperty("data")) {
        return {
          data: response.data,
          success: true,
          message: "OK",
        };
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Produtos
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products", "GET");
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`, "GET");
  }

  async createProduct(
    product: CreateProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.request<Product>("/products", "POST", product);
  }

  async updateProduct(
    id: number,
    product: Partial<CreateProductRequest>
  ): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`, "PUT", product);
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/products/${id}`, "DELETE");
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>("/dashboard/stats", "GET");
  }

  // Aplicar desconto em múltiplos produtos
  async applyDiscount(
    productIds: number[],
    discountPercentage: number
  ): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products/discount", "POST", {
      productIds,
      discountPercentage,
    });
  }

  // Reverter desconto em múltiplos produtos
  async revertDiscount(productIds: number[]): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(
      "/products/revert-discount",
      "POST",
      productIds
    );
  }

  // Aumentar preço em múltiplos produtos
  async increasePrice(
    productIds: number[],
    increasePercentage: number
  ): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products/increase", "POST", {
      productIds,
      increasePercentage,
    });
  }
}

export const apiProductService = new ApiProductService();
export default apiProductService;
