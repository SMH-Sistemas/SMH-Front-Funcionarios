import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import LPUs from "./pages/LPUs";
import Pedidos from "./pages/Order";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas - Apenas Login e Register */}
        <Route
          path="/"
          element={
            <ProtectedRoute requireAuth={false}>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          }
        />

        {/* Rotas protegidas - Requerem autenticação */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <LPUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/lpu/:lpuId"
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute requireAuth={true}>
              <Pedidos />
            </ProtectedRoute>
          }
        />

        {/* Rota 404 - Protegida, redireciona para login se não autenticado */}
        <Route
          path="*"
          element={
            <ProtectedRoute requireAuth={true}>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
