import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderResponseDTO } from "@/services/api.order";
import {
  Package,
  User,
  MapPin,
  Truck,
  FileText,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Building2,
} from "lucide-react";

type PedidoDetalhesModalProps = {
  order: OrderResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const statusBadgeVariant: Record<string, any> = {
  PENDING: "secondary",
  PAID: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const PedidoDetalhesModal = ({
  order,
  open,
  onOpenChange,
}: PedidoDetalhesModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes do Pedido - {order.orderNumber}
            </DialogTitle>
            <Badge variant={statusBadgeVariant[order.orderStatus]}>
              {statusLabel[order.orderStatus]}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="itens">
              Itens ({order.items.length})
            </TabsTrigger>
            <TabsTrigger value="entrega">Entrega</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="geral" className="space-y-4">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">{order.customer.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Vendedor */}
            {order.employee && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Vendedor Responsável
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {order.employee.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.employee.email}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data e Horário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Data de Criação (UTC):
                  </span>
                  <span className="font-medium">
                    {new Date(order.createdAtUtc).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Horário Local do Cliente:
                  </span>
                  <span className="font-medium">
                    {new Date(order.clientLocalTime).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuso Horário:</span>
                  <span className="font-medium">{order.clientTimezone}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Itens */}
          <TabsContent value="itens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={item.id} className="pb-3 border-b last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            NCM: {item.productNcm}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {item.subtotal.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Qtd:</span>{" "}
                          {item.quantity}
                        </div>
                        <div>
                          <span className="font-medium">Preço Unit.:</span>{" "}
                          {item.unitPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </div>
                        {item.taxValue > 0 && (
                          <div>
                            <span className="font-medium">Imposto:</span>{" "}
                            {item.taxValue.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Entrega */}
          <TabsContent value="entrega" className="space-y-4">
            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  {order.deliveryAddress.street}, {order.deliveryAddress.number}
                  {order.deliveryAddress.complement &&
                    ` - ${order.deliveryAddress.complement}`}
                </p>
                <p>
                  {order.deliveryAddress.district} -{" "}
                  {order.deliveryAddress.city}/{order.deliveryAddress.state}
                </p>
                <p>CEP: {order.deliveryAddress.cep}</p>
              </CardContent>
            </Card>

            {/* Informações de Transporte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informações de Transporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transportadora:</span>
                  <span className="font-medium">
                    {order.transportInfo.carrierName}
                  </span>
                </div>
                {order.transportInfo.trackingCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Código de Rastreio:
                    </span>
                    <span className="font-medium font-mono">
                      {order.transportInfo.trackingCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Previsão de Entrega:
                  </span>
                  <span className="font-medium">
                    {new Date(
                      order.transportInfo.expectedDeliveryDate
                    ).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Financeiro */}
          <TabsContent value="financeiro" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm pb-2 border-b"
                    >
                      <span>
                        {item.productName} (x{item.quantity})
                      </span>
                      <span>
                        {item.subtotal.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total de Impostos */}
                {order.items.some((item) => item.taxValue > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total de Impostos:
                    </span>
                    <span>
                      {order.items
                        .reduce((sum, item) => sum + item.taxValue, 0)
                        .toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                    </span>
                  </div>
                )}

                <Separator />

                {/* Valor Total */}
                <div className="flex justify-between text-lg font-bold">
                  <span>Valor Total:</span>
                  <span className="text-primary">
                    {order.totalAmount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
