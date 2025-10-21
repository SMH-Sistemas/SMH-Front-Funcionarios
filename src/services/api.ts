// Configuração base da API
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  discount: number;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  discount?: number;
  status?: "active" | "inactive";
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
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
  role: "admin" | "user";
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

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      // Inclui cookies HttpOnly enviados pelo backend (JWT em cookie seguro)
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Produtos
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products");
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(
    product: CreateProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(
    product: UpdateProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${product.id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>("/dashboard/stats");
  }

  // Aplicar desconto em múltiplos produtos
  async applyDiscount(
    productIds: string[],
    discount: number
  ): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products/discount", {
      method: "POST",
      body: JSON.stringify({ productIds, discount }),
    });
  }

  // Autenticação
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>("/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me");
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>("/auth/refresh", {
      method: "POST",
    });
  }
}

export const apiService = new ApiService();
export default apiService;
