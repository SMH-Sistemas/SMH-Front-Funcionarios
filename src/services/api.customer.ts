// src/services/api.customer.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import apiAuthService from "./api.auth";
import { ApiResponse, extractErrorMessage } from "@/types/api.types";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/api/v1";

// DTOs
export interface CustomerDTO {
  id: string;
  name: string;
  surname: string;
  email: string;
  fiscalIdentification: string;
  phoneNumber: string;
}

class ApiCustomerService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor de request
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(
          `[Customer API Request] ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("[Customer API Request Error]", error);
        return Promise.reject(error);
      }
    );

    // Interceptor de response
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(
          `[Customer API Response] ${response.status} ${response.config.url}`
        );
        return response;
      },
      async (error: AxiosError) => {
        console.error(
          `[Customer API Response Error] ${error.response?.status} ${error.config?.url}`,
          error.response?.data
        );

        // Tentar refresh do token se receber 401
        if (
          error.response?.status === 401 &&
          !error.config?.url?.includes("/auth/")
        ) {
          try {
            console.log("[Customer API] Tentando refresh do token...");
            await apiAuthService.refreshToken();
            console.log(
              "[Customer API] Token refreshed, reenviando requisição..."
            );

            if (error.config) {
              return this.axiosInstance.request(error.config);
            }
          } catch (refreshError) {
            console.error(
              "[Customer API] Falha ao fazer refresh do token:",
              refreshError
            );
            throw error;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getAllCustomers(): Promise<ApiResponse<CustomerDTO[]>> {
    try {
      const response = await this.axiosInstance.get<CustomerDTO[]>(
        "/customers"
      );
      return {
        success: true,
        data: response.data,
        message: "Clientes obtidos com sucesso",
      };
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      const message = extractErrorMessage(error);
      return {
        success: false,
        data: [] as CustomerDTO[],
        message,
      };
    }
  }

  async getCustomerById(id: string): Promise<ApiResponse<CustomerDTO>> {
    try {
      const response = await this.axiosInstance.get<CustomerDTO>(
        `/customers/${id}`
      );
      return {
        success: true,
        data: response.data,
        message: "Cliente obtido com sucesso",
      };
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      const message = extractErrorMessage(error);
      return {
        success: false,
        data: {} as CustomerDTO,
        message,
      };
    }
  }
}

const apiCustomerService = new ApiCustomerService();
export default apiCustomerService;
