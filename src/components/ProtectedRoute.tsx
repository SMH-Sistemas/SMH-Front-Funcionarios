import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
}: ProtectedRouteProps) => {
  const location = useLocation();

  // IMPORTANTE: Chamar useIsAuthenticated SEMPRE para respeitar as regras dos hooks do React
  // Cookies HttpOnly são enviados automaticamente, não precisamos verificar localStorage
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  // Log de tentativa de acesso
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      console.warn(
        `[ProtectedRoute] Acesso negado a ${location.pathname} - Não autenticado`
      );
    }
  }, [requireAuth, isAuthenticated, isLoading, location.pathname]);

  console.log("[ProtectedRoute]", {
    path: location.pathname,
    requireAuth,
    isAuthenticated,
    isLoading,
  });

  // Se a rota requer autenticação e usuário NÃO está autenticado (após verificação)
  if (requireAuth && !isAuthenticated && !isLoading) {
    console.log(
      "[ProtectedRoute] ❌ Redirecionando para /login - Não autenticado"
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota não requer autenticação (como login/register) e usuário está autenticado
  // Redirecionar para dashboard
  if (!requireAuth && isAuthenticated) {
    console.log(
      "[ProtectedRoute] ✅ Redirecionando para /dashboard - Usuário já autenticado"
    );
    return <Navigate to="/dashboard" replace />;
  }

  // Mostrar loading APENAS quando está verificando autenticação
  if (isLoading && requireAuth) {
    console.log("[ProtectedRoute] ⏳ Verificando autenticação...");
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  console.log("[ProtectedRoute] ✅ Renderizando conteúdo");
  return <>{children}</>;
};
