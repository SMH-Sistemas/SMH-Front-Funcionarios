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
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-muted/30 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              #{index + 1}
                            </span>
                            <p className="font-semibold">{item.productName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            NCM: {item.productNcm}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Subtotal
                          </p>
                          <p className="font-semibold text-lg">
                            {item.subtotal.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="p-2 bg-background rounded">
                          <p className="text-xs text-muted-foreground">
                            Quantidade
                          </p>
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        <div className="p-2 bg-background rounded">
                          <p className="text-xs text-muted-foreground">
                            Preço Unitário
                          </p>
                          <p className="font-medium">
                            {item.unitPrice.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
                        <div
                          className={`p-2 rounded ${
                            item.taxValue > 0
                              ? "bg-orange-50 border border-orange-200"
                              : "bg-background"
                          }`}
                        >
                          <p
                            className={`text-xs ${
                              item.taxValue > 0
                                ? "text-orange-700"
                                : "text-muted-foreground"
                            }`}
                          >
                            Imposto
                          </p>
                          <p
                            className={`font-medium ${
                              item.taxValue > 0 ? "text-orange-600" : ""
                            }`}
                          >
                            {(item.taxValue || 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
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
            {/* Resumo por Item */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-muted/30 space-y-2"
                  >
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
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Qtd:</span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unit.:</span>
                          <span className="font-medium">
                            {item.unitPrice.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Subtotal:
                          </span>
                          <span className="font-medium">
                            {item.subtotal.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={
                              item.taxValue > 0
                                ? "text-orange-600"
                                : "text-muted-foreground"
                            }
                          >
                            Imposto:
                          </span>
                          <span
                            className={`font-medium ${
                              item.taxValue > 0 ? "text-orange-600" : ""
                            }`}
                          >
                            {(item.taxValue || 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {item.taxValue > 0 && (
                      <div className="pt-2 border-t border-orange-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-orange-700 font-medium">
                            Total com Imposto:
                          </span>
                          <span className="font-semibold text-orange-600">
                            {(
                              item.subtotal + (item.taxValue || 0)
                            ).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {/* Subtotal */}
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">
                    {order.items
                      .reduce((sum, item) => sum + item.subtotal, 0)
                      .toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                  </span>
                </div>

                {/* Total de Impostos */}
                {order.items.some((item) => item.taxValue > 0) && (
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">
                      Total de Impostos:
                    </span>
                    <span className="font-semibold text-orange-600">
                      +{" "}
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
                <div className="flex justify-between text-xl font-bold">
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
