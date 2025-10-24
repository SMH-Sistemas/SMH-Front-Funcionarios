import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Saida } from "@/types/saida";
import type { OrderResponseDTO } from "@/services/api.order";
import { Timeline } from "./Timeline";
import { FileText, Mail, RotateCcw, X as XIcon, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type PedidoDetalhesProps = {
  saida?: Saida | null;
  order?: OrderResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: any, status: any) => void;
};

const statusBadgeVariant = {
  rascunho: "secondary",
  reservado: "default",
  em_transporte: "default",
  entregue: "default",
  cancelado: "destructive",
  estornado: "secondary",
} as const;

const statusLabel = {
  rascunho: "Rascunho",
  reservado: "Reservado",
  em_transporte: "Em Transporte",
  entregue: "Entregue",
  cancelado: "Cancelado",
  estornado: "Estornado",
};

export const PedidoDetalhes = ({
  saida,
  open,
  onOpenChange,
  onUpdateStatus,
}: PedidoDetalhesProps) => {
  const { toast } = useToast();
  const [showCancelarDialog, setShowCancelarDialog] = useState(false);
  const [showEstornarDialog, setShowEstornarDialog] = useState(false);

  if (!saida) return null;

  const handleGerarPDF = () => {
    toast({
      title: "PDF Gerado",
      description: "O arquivo foi baixado com sucesso (simulado)",
    });
  };

  const handleEnviarNotificacao = () => {
    toast({
      title: "Notificação Enviada",
      description: "E-mail e WhatsApp enviados ao cliente (simulado)",
    });
  };

  const handleCancelar = () => {
    onUpdateStatus(saida.id, "cancelado");
    toast({
      title: "Saída Cancelada",
      description: `Saída ${saida.numero} foi cancelada`,
      variant: "destructive",
    });
    setShowCancelarDialog(false);
  };

  const handleEstornar = () => {
    onUpdateStatus(saida.id, "estornado");
    toast({
      title: "Saída Estornada",
      description: `Saída ${saida.numero} foi estornada e o estoque foi devolvido (simulado)`,
    });
    setShowEstornarDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  Saída {saida.numero}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(saida.data).toLocaleString("pt-BR")}
                </p>
              </div>
              <Badge
                variant={statusBadgeVariant[saida.status]}
                className="text-sm"
              >
                {statusLabel[saida.status]}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleGerarPDF}>
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnviarNotificacao}
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Notificação
            </Button>
            {saida.status !== "cancelado" && saida.status !== "estornado" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelarDialog(true)}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                {saida.status === "entregue" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEstornarDialog(true)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Estornar
                  </Button>
                )}
              </>
            )}
          </div>

          <Tabs defaultValue="detalhes" className="mt-4">
            <TabsList>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="logs">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Cliente</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{saida.cliente.nome}</p>
                  <p className="text-muted-foreground">
                    {saida.cliente.cpfCnpj}
                  </p>
                  <p className="text-muted-foreground">
                    {saida.cliente.telefone} • {saida.cliente.email}
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {saida.dadosEnvio.enderecoEntrega.rua},{" "}
                    {saida.dadosEnvio.enderecoEntrega.numero}
                    {saida.dadosEnvio.enderecoEntrega.complemento &&
                      ` - ${saida.dadosEnvio.enderecoEntrega.complemento}`}
                  </p>
                  <p>
                    {saida.dadosEnvio.enderecoEntrega.bairro} -{" "}
                    {saida.dadosEnvio.enderecoEntrega.cidade}/
                    {saida.dadosEnvio.enderecoEntrega.estado}
                  </p>
                  <p>CEP: {saida.dadosEnvio.enderecoEntrega.cep}</p>
                </div>
              </Card>

              {(saida.dadosEnvio.transportadora ||
                saida.dadosEnvio.numeroRastreio) && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Transporte</h3>
                  <div className="text-sm space-y-1">
                    {saida.dadosEnvio.transportadora && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Transportadora:</span>{" "}
                        {saida.dadosEnvio.transportadora}
                      </p>
                    )}
                    {saida.dadosEnvio.numeroRastreio && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Rastreio:</span>{" "}
                        {saida.dadosEnvio.numeroRastreio}
                      </p>
                    )}
                    {saida.dadosEnvio.dataPrevista && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Entrega prevista:</span>{" "}
                        {new Date(
                          saida.dadosEnvio.dataPrevista
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </Card>
              )}

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Itens</h3>
                <div className="space-y-3">
                  {saida.itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between pb-3 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.sku} • {item.quantidade} {item.unidade} x{" "}
                          {item.precoUnitario.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {item.subtotal.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      {saida.valorTotal.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card className="p-6">
                <Timeline items={saida.timeline} currentStatus={saida.status} />
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card className="p-4">
                <div className="space-y-4">
                  {saida.logs.map((log) => (
                    <div
                      key={log.id}
                      className="border-l-2 border-primary pl-4"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{log.acao}</p>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.data).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Por: {log.usuario}
                      </p>
                      <p className="text-sm mt-1">{log.detalhes}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showCancelarDialog}
        onOpenChange={setShowCancelarDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Saída</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a saída {saida.numero}? Esta ação
              não pode ser desfeita e o estoque será devolvido (simulado).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelar}>
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showEstornarDialog}
        onOpenChange={setShowEstornarDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estornar Saída</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja estornar a saída {saida.numero}? O estoque
              será devolvido e a saída marcada como estornada (simulado).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEstornar}>
              Confirmar Estorno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
