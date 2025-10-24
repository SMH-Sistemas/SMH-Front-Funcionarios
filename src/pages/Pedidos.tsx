import { useState } from "react";
import { ArrowLeft, FileText, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PedidosTable } from "@/components/out/PedidosTable";
import { NovoPedidoModal } from "@/components/out/NovoPedidoModal";
import { PedidoDetalhesModal } from "@/components/out/PedidoDetalhesModal";
import { EnviarPropostaModal } from "@/components/out/EnviarPropostaModal";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrderStatus,
  useDeleteOrder,
} from "@/hooks/useOrders";
import type { OrderResponseDTO, OrderRequestDTO } from "@/services/api.order";

const Pedidos = () => {
  const navigate = useNavigate();

  // React Query hooks
  const { data: orders = [], isLoading, error } = useOrders();
  const createOrderMutation = useCreateOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const deleteOrderMutation = useDeleteOrder();

  // Estados locais
  const [isNovoPedidoOpen, setIsNovoPedidoOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(
    null
  );
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [isEnviarEmailOpen, setIsEnviarEmailOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const handleSaveOrder = (orderData: OrderRequestDTO) => {
    createOrderMutation.mutate(orderData);
    setIsNovoPedidoOpen(false);
  };

  const handleDeleteOrder = (id: number) => {
    deleteOrderMutation.mutate(id);
  };

  const handleViewOrder = (order: OrderResponseDTO) => {
    setSelectedOrder(order);
    setIsDetalhesOpen(true);
  };

  const handleEditOrder = (order: OrderResponseDTO) => {
    setSelectedOrder(order);
    setIsEditarOpen(true);
  };

  const handleSendEmail = (order: OrderResponseDTO) => {
    setSelectedOrder(order);
    setIsEnviarEmailOpen(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ orderId: id, status });
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background shadow-sm">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  Gestão de Pedidos
                </h1>
                <p className="text-xs text-muted-foreground">
                  Gerenciamento de pedidos e entregas
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsNovoPedidoOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Pedido
          </Button>
        </div>
      </header>

      <main className="p-8">
        <Card className="shadow-md">
          <div className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Lista de Pedidos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie seus pedidos e entregas
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número ou cliente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Carregando pedidos...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="text-center text-destructive">
                <p className="font-medium">Erro ao carregar pedidos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente novamente mais tarde
                </p>
              </div>
            </div>
          ) : (
            <PedidosTable
              orders={filteredOrders}
              onView={handleViewOrder}
              onEdit={handleEditOrder}
              onSendEmail={handleSendEmail}
              onCancel={handleDeleteOrder}
            />
          )}
        </Card>
      </main>

      <NovoPedidoModal
        open={isNovoPedidoOpen}
        onOpenChange={setIsNovoPedidoOpen}
        onSave={handleSaveOrder}
      />

      <PedidoDetalhesModal
        order={selectedOrder}
        open={isDetalhesOpen}
        onOpenChange={setIsDetalhesOpen}
      />

      <EnviarPropostaModal
        order={selectedOrder}
        open={isEnviarEmailOpen}
        onOpenChange={setIsEnviarEmailOpen}
      />

      <NovoPedidoModal
        open={isEditarOpen}
        onOpenChange={setIsEditarOpen}
        onSave={handleSaveOrder}
        editOrder={selectedOrder}
      />
    </div>
  );
};

export default Pedidos;
