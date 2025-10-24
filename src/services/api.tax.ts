// src/services/api.tax.ts
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
export enum TaxType {
  EMPREITADA_GLOBAL = "EMPREITADA_GLOBAL",
  ICMS = "ICMS",
  ISS = "ISS",
  OUTRO = "OUTRO",
}

// Tax Response
export interface TaxResponseDTO {
  id: number;
  type: TaxType;
  percentage: number;
  description: string;
}

// Tax Request
export interface TaxRequestDTO {
  type: TaxType;
  percentage: number;
  description: string;
}

class ApiTaxService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true, // envia cookies httpOnly
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para requisições
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Cookies HttpOnly são enviados automaticamente pelo navegador
        console.log(
          `[API Tax] ${config.method?.toUpperCase()} ${config.baseURL}${
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
        console.log(`[API Tax] Response ${response.status}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Se 401, tentar refresh e refazer a requisição (uma vez)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log(
            "[API Tax] 🔄 Token expirado, renovando automaticamente..."
          );

          try {
            await apiAuthService.refreshToken();
            console.log(
              "[API Tax] ✅ Token renovado com sucesso, refazendo requisição"
            );
            // Refazer a requisição original com o novo token (em cookies)
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error(
              "[API Tax] ❌ Falha ao renovar token, redirecionando para login"
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

        console.error(`[API Tax] Erro: ${errorMessage}`);
        if (error.response?.data) {
          console.error(
            "[API Tax] Detalhes:",
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

  // --- Tax endpoints ---

  async getAllTaxes(): Promise<ApiResponse<TaxResponseDTO[]>> {
    return this.request<TaxResponseDTO[]>("/taxes", "GET");
  }

  async getTaxById(id: number): Promise<ApiResponse<TaxResponseDTO>> {
    return this.request<TaxResponseDTO>(`/taxes/${id}`, "GET");
  }

  async getTaxByType(type: TaxType): Promise<ApiResponse<TaxResponseDTO>> {
    return this.request<TaxResponseDTO>(`/taxes/type/${type}`, "GET");
  }

  async createTax(data: TaxRequestDTO): Promise<ApiResponse<TaxResponseDTO>> {
    return this.request<TaxResponseDTO>("/taxes", "POST", data);
  }

  async updateTax(
    id: number,
    data: TaxRequestDTO
  ): Promise<ApiResponse<TaxResponseDTO>> {
    return this.request<TaxResponseDTO>(`/taxes/${id}`, "PUT", data);
  }

  async deleteTax(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/taxes/${id}`, "DELETE");
  }
}

export const apiTaxService = new ApiTaxService();
export default apiTaxService;
