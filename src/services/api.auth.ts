// src/services/api.auth.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import {
  ApiResponse,
  ErrorResponse,
  extractErrorMessage,
} from "@/types/api.types";

// Base da API definida no .env
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/api/v1";

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
  surname: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface AuthMessageResponse {
  message: string;
}

class ApiAuthenticationService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true, // Envia e recebe cookies HttpOnly
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
          `[API Auth] ${config.method?.toUpperCase()} ${config.baseURL}${
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
        console.log(`[API Auth] Response ${response.status}`, {
          url: response.config.url,
          success: response.data?.success,
        });

        // Cookies HttpOnly são salvos automaticamente pelo navegador
        // Não precisamos salvar nada manualmente
        if (response.config.url?.includes("/auth/")) {
          console.log(
            `[API Auth] ✅ Cookies HttpOnly gerenciados automaticamente pelo navegador`
          );
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Se 401, tentar refresh (exceto nos endpoints de login/register/refresh)
        if (error.response?.status === 401 && !originalRequest._retry) {
          const isAuthEndpoint =
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/register") ||
            originalRequest.url?.includes("/auth/refresh");

          if (!isAuthEndpoint) {
            originalRequest._retry = true;
            console.log(
              "[API Auth] 🔄 Token expirado, renovando automaticamente..."
            );

            try {
              await this.refreshToken();
              console.log(
                "[API Auth] ✅ Token renovado com sucesso, refazendo requisição"
              );
              // Refazer a requisição original com o novo token (em cookies)
              return this.axiosInstance(originalRequest);
            } catch (refreshError) {
              console.error("[API Auth] ❌ Falha ao renovar token");
              // Se o refresh falhar, redirecionar para login será feito pelo ProtectedRoute
              return Promise.reject(error);
            }
          } else {
            console.log(
              "[API Auth] ⚠️ Erro 401 em endpoint de autenticação, não tentando refresh"
            );
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

        console.error(`[API Auth] Erro: ${errorMessage}`);
        if (error.response?.data) {
          console.error(
            "[API Auth] Detalhes:",
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

  // --- Auth endpoints ---

  async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthMessageResponse>> {
    const response = await this.request<AuthMessageResponse>(
      "/auth/login",
      "POST",
      credentials
    );

    console.log(
      "[API Auth] Login bem-sucedido, cookies HttpOnly salvos automaticamente"
    );

    return response;
  }

  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthMessageResponse>> {
    const response = await this.request<AuthMessageResponse>(
      "/auth/register",
      "POST",
      userData
    );

    console.log(
      "[API Auth] Registro bem-sucedido, cookies HttpOnly salvos automaticamente"
    );

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    console.log(
      "[API Auth] Logout - cookies HttpOnly serão limpos pelo backend"
    );
    return this.request<void>("/auth/logout", "POST", { refreshToken: "" });
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    // RefreshToken está em cookie HttpOnly, o backend lê automaticamente
    const response = await this.request<{ accessToken: string }>(
      "/auth/refresh",
      "POST",
      {}
    );

    console.log(
      "[API Auth] Token atualizado, cookies HttpOnly gerenciados automaticamente"
    );

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me", "GET");
  }
}

export const apiAuthenticationService = new ApiAuthenticationService();
export default apiAuthenticationService;
