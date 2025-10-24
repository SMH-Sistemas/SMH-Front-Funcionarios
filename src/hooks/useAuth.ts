import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiAuthenticationService as apiAuthenticationService,
  type LoginRequest,
  type RegisterRequest,
  type User,
} from "@/services/api.auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Estado global de autenticação (apenas em memória)
let authState = {
  isAuthenticated: false,
  lastLogin: null as number | null,
  authCheckAttempted: false, // Flag para saber se já tentamos verificar auth
  authFailed: false, // Flag para saber se a verificação falhou
  justLoggedIn: false, // Flag para saber se acabou de fazer login
};

// Função para verificar se o login é recente (últimos 5 minutos)
const isRecentLogin = () => {
  if (!authState.lastLogin) return false;
  return Date.now() - authState.lastLogin < 5 * 60 * 1000; // 5 minutos
};

// Hook para obter usuário atual
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      console.log("[AUTH] Tentando buscar usuário. Estado atual:", {
        authCheckAttempted: authState.authCheckAttempted,
        authFailed: authState.authFailed,
        justLoggedIn: authState.justLoggedIn,
        isAuthenticated: authState.isAuthenticated,
      });

      authState.authCheckAttempted = true;

      try {
        const response = await apiAuthenticationService.getCurrentUser();
        console.log("[AUTH] auth/me retornou sucesso");

        // Se sucesso, marcar como autenticado
        authState.isAuthenticated = true;
        authState.authFailed = false;
        authState.lastLogin = Date.now();
        authState.justLoggedIn = false; // Limpar flag de login recente
        return response.data;
      } catch (error: any) {
        console.log("[AUTH] auth/me falhou:", error?.message);

        // Se for erro de autenticação (401/403), marcar que falhou
        const isAuthError =
          error?.message?.includes("401") ||
          error?.message?.includes("403") ||
          error?.message?.includes("Não Autorizado") ||
          error?.message?.includes("não autorizado") ||
          error?.message?.includes("Unauthorized");
        const justLoggedIn = authState.justLoggedIn;

        console.log(
          "[AUTH] isAuthError:",
          isAuthError,
          "justLoggedIn:",
          justLoggedIn
        );

        // SEMPRE marcar como falhou se for erro de auth, independente de justLoggedIn
        if (isAuthError) {
          authState.authFailed = true;
          authState.isAuthenticated = false;
          authState.lastLogin = null;
          authState.justLoggedIn = false; // Limpar flag imediatamente

          console.log(
            "[AUTH] Erro de autenticação - Cookies HttpOnly serão limpos pelo backend"
          );
        }

        throw error; // Re-throw para marcar a query como error
      }
    },
    retry: (failureCount, error: any) => {
      // Não fazer retry se for erro de autenticação (401/403)
      const isAuthError =
        error?.message?.includes("401") ||
        error?.message?.includes("403") ||
        error?.message?.includes("Não Autorizado") ||
        error?.message?.includes("não autorizado") ||
        error?.message?.includes("Unauthorized");

      if (isAuthError) {
        console.log("[AUTH] Não fazer retry para erro de autenticação");
        authState.justLoggedIn = false;
        authState.authFailed = true;
        return false;
      }

      // Se acabou de fazer login e falhou por outro motivo, tentar mais 2 vezes
      const shouldRetry = authState.justLoggedIn && failureCount < 2;
      console.log(
        "[AUTH] Retry? failureCount:",
        failureCount,
        "shouldRetry:",
        shouldRetry
      );

      if (!shouldRetry && authState.justLoggedIn) {
        // Se não vai tentar mais e era um login recente, limpar a flag
        console.log("[AUTH] Limpando justLoggedIn após falhas");
        authState.justLoggedIn = false;
      }

      return shouldRetry;
    },
    retryDelay: 300, // Reduzido para 300ms
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // Cache por 10 minutos
    // Sempre tentar verificar o usuário EXCETO se já falhou explicitamente
    // Cookies HttpOnly são enviados automaticamente pelo navegador
    enabled: () => {
      const shouldEnable = !authState.authFailed || authState.justLoggedIn;
      console.log("[AUTH] Query enabled?", {
        justLoggedIn: authState.justLoggedIn,
        authCheckAttempted: authState.authCheckAttempted,
        authFailed: authState.authFailed,
        shouldEnable,
      });
      return shouldEnable;
    },
    // Timeout mais curto para detecção rápida
    networkMode: "online",
  });
};

// Hook para login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiAuthenticationService.login(credentials);
      return response.data;
    },
    onSuccess: async (authData) => {
      console.log("[LOGIN] Login bem-sucedido, configurando estado...");

      // Marcar que acabou de fazer login
      authState.justLoggedIn = true;
      authState.lastLogin = Date.now();
      authState.authFailed = false;
      authState.authCheckAttempted = false; // Resetar para permitir nova verificação
      authState.isAuthenticated = true; // Marcar como autenticado imediatamente

      // Invalidar queries para forçar refetch do usuário
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      toast.success("Login realizado com sucesso!");

      console.log(
        "[LOGIN] Cookies HttpOnly salvos pelo navegador, redirecionando para /dashboard..."
      );

      // Pequeno delay para garantir que a query foi invalidada
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirecionar para dashboard
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      console.error("[LOGIN] Erro no login:", error);
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
      const response = await apiAuthenticationService.register(userData);
      return response.data;
    },
    onSuccess: async (authData) => {
      console.log("[REGISTER] Registro bem-sucedido, configurando estado...");

      // Marcar que acabou de fazer login
      authState.justLoggedIn = true;
      authState.lastLogin = Date.now();
      authState.authFailed = false;
      authState.authCheckAttempted = false; // Resetar para permitir nova verificação
      authState.isAuthenticated = true; // Marcar como autenticado imediatamente

      // Invalidar queries para forçar refetch do usuário
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      toast.success("Conta criada com sucesso!");

      console.log(
        "[REGISTER] Cookies HttpOnly salvos pelo navegador, redirecionando para /dashboard..."
      );

      // Pequeno delay para garantir que a query foi invalidada
      await new Promise((resolve) => setTimeout(resolve, 100));

      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      console.error("[REGISTER] Erro no registro:", error);
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
      await apiAuthenticationService.logout();
    },
    onSuccess: () => {
      // Limpar estado de autenticação
      authState.isAuthenticated = false;
      authState.lastLogin = null;
      authState.authFailed = true;
      authState.justLoggedIn = false;
      authState.authCheckAttempted = false;

      console.log("[AUTH] Cookies HttpOnly limpos pelo backend no logout");

      // Limpar cache do React Query
      queryClient.clear();

      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    },
    onError: (error) => {
      console.error("Erro no logout:", error);
      // Mesmo com erro, limpar cache local
      authState.isAuthenticated = false;
      authState.lastLogin = null;
      authState.authFailed = true;
      authState.justLoggedIn = false;
      authState.authCheckAttempted = false;

      console.log(
        "[AUTH] Cookies HttpOnly limpos pelo backend no logout (com erro)"
      );

      queryClient.clear();
      navigate("/login");
    },
  });
};

// Hook para verificar se usuário está autenticado
export const useIsAuthenticated = () => {
  const { data: user, isLoading, error, isFetching } = useCurrentUser();

  // Verificar autenticação baseado APENAS no authState (cookies HttpOnly gerenciados automaticamente)
  const isAuthenticated = authState.isAuthenticated;

  // Mostrar loading se:
  // 1. A query está carregando pela primeira vez (!authState.authCheckAttempted && isLoading)
  // 2. A query está carregando após login (authState.justLoggedIn && isLoading)
  // 3. A query está buscando dados (isFetching && !authState.authFailed)
  const actuallyLoading =
    (!authState.authCheckAttempted && (isLoading || isFetching)) ||
    (authState.justLoggedIn && isLoading) ||
    (isFetching && !authState.authFailed && !authState.isAuthenticated);

  console.log("[AUTH] useIsAuthenticated chamado:", {
    isAuthenticated,
    isLoading,
    isFetching,
    actuallyLoading,
    hasUser: !!user,
    hasError: !!error,
    authState: { ...authState },
  });

  return {
    isAuthenticated,
    user,
    isLoading: actuallyLoading,
  };
};
