import { Eye, Trash2, Pencil, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderResponseDTO } from "@/services/api.order";

type PedidosTableProps = {
  orders: OrderResponseDTO[];
  onView: (order: OrderResponseDTO) => void;
  onEdit: (order: OrderResponseDTO) => void;
  onSendEmail: (order: OrderResponseDTO) => void;
  onCancel: (id: number) => void;
};

const statusBadgeVariant: Record<string, any> = {
  PENDING: "secondary",
  PAID: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
  pending: "secondary",
  paid: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const PedidosTable = ({
  orders,
  onView,
  onEdit,
  onSendEmail,
  onCancel,
}: PedidosTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Número</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-right">Total Itens</TableHead>
          <TableHead className="text-right">Valor Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-center text-muted-foreground py-8"
            >
              Nenhum pedido encontrado
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                {new Date(order.createdAtUtc).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.customer.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {order.customer.phone || order.customer.email}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">{order.items.length}</TableCell>
              <TableCell className="text-right">
                {order.totalAmount.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    statusBadgeVariant[order.status] ||
                    statusBadgeVariant[order.orderStatus]
                  }
                >
                  {statusLabel[order.status] ||
                    statusLabel[order.orderStatus] ||
                    order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {order.deliveryAddress.city}/{order.deliveryAddress.state}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(order)}
                    title="Visualizar detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSendEmail(order)}
                    title="Enviar proposta por email"
                  >
                    <Mail className="h-4 w-4 text-green-600" />
                  </Button>
                  {(order.status === "PENDING" ||
                    order.status === "pending" ||
                    order.orderStatus === "PENDING") && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(order)}
                        title="Editar pedido"
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCancel(order.id)}
                        title="Cancelar pedido"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
