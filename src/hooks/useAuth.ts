import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiService,
  type LoginRequest,
  type RegisterRequest,
  type User,
} from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Hook para obter usuário atual
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await apiService.getCurrentUser();
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiService.login(credentials);
      return response.data;
    },
    onSuccess: (authData) => {
      // Token vem via cookie HttpOnly; apenas atualizar cache do usuário
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Erro no login:", error);
      toast.error("Credenciais inválidas. Tente novamente.");
    },
  });
};

// Hook para registro
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await apiService.register(userData);
      return response.data;
    },
    onSuccess: (authData) => {
      // Token vem via cookie HttpOnly; apenas atualizar cache do usuário
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("Erro no registro:", error);
      toast.error("Erro ao criar conta. Tente novamente.");
    },
  });
};

// Hook para logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await apiService.logout();
    },
    onSuccess: () => {
      // Limpar cache do React Query
      queryClient.clear();

      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    },
    onError: (error) => {
      console.error("Erro no logout:", error);
      // Mesmo com erro, limpar cache local
      queryClient.clear();
      navigate("/login");
    },
  });
};

// Hook para verificar se usuário está autenticado
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    user,
    isLoading,
  };
};
