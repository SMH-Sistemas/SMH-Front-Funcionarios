// src/services/api.lpu.ts
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
export enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  DISCONTINUED = "DISCONTINUED",
}

export enum ProductType {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
}

// Product dentro da LPU
export interface ProductResponseDTO {
  id: number;
  productId: number;
  name: string;
  imgUrl?: string;
  description?: string;
  stockQuantity: number;
  cost: number;
  profitMargin: number;
  category: string;
  ncm: string;
  price: number;
  unityPrice: string;
  type: ProductType;
  status: ProductStatus;
  discountedApplied: boolean;
}

// LPU Response
export interface LPUResponseDTO {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  products: ProductResponseDTO[];
}

// Product Request DTO (para criar novo produto)
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
  type: ProductType;
  status: ProductStatus;
}

// LPU Request
export interface LPURequestDTO {
  name: string;
  description?: string;
  category?: string;
  active?: boolean;
  productIds?: number[]; // IDs de produtos existentes para adicionar
  newProduct?: ProductRequestDTO; // Novo produto a ser criado e adicionado
}

class ApiLPUService {
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
          `[API LPU] ${config.method?.toUpperCase()} ${config.baseURL}${
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
        console.log(`[API LPU] Response ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Se 401, tentar refresh e refazer a requisição (uma vez)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log(
            "[API LPU] 🔄 Token expirado, renovando automaticamente..."
          );

          try {
            await apiAuthService.refreshToken();
            console.log(
              "[API LPU] ✅ Token renovado com sucesso, refazendo requisição"
            );
            // Refazer a requisição original com o novo token (em cookies)
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error(
              "[API LPU] ❌ Falha ao renovar token, redirecionando para login"
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

        console.error(`[API LPU] Erro: ${errorMessage}`);
        if (error.response?.data) {
          console.error(
            "[API LPU] Detalhes:",
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

  // Endpoints de LPU

  async getAllLPUs(): Promise<ApiResponse<LPUResponseDTO[]>> {
    return this.request<LPUResponseDTO[]>("/lpu", "GET");
  }

  async getLPUById(id: number): Promise<ApiResponse<LPUResponseDTO>> {
    return this.request<LPUResponseDTO>(`/lpu/${id}`, "GET");
  }

  async createLPU(
    lpuData: LPURequestDTO
  ): Promise<ApiResponse<LPUResponseDTO>> {
    return this.request<LPUResponseDTO>("/lpu", "POST", lpuData);
  }

  async updateLPU(
    id: number,
    lpuData: LPURequestDTO
  ): Promise<ApiResponse<LPUResponseDTO>> {
    return this.request<LPUResponseDTO>(`/lpu/${id}`, "PUT", lpuData);
  }

  async addProductToLPU(
    lpuId: number,
    data: { productIds?: number[]; newProduct?: ProductRequestDTO }
  ): Promise<ApiResponse<LPUResponseDTO>> {
    // Criar o DTO para o backend
    const lpuRequestDTO: Partial<LPURequestDTO> = {
      productIds: data.productIds,
      newProduct: data.newProduct,
    };
    return this.request<LPUResponseDTO>(
      `/lpu/${lpuId}/add-product`,
      "POST",
      lpuRequestDTO
    );
  }

  async deleteLPU(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/lpu/${id}`, "DELETE");
  }
}

export const apiLPUService = new ApiLPUService();
export default apiLPUService;
