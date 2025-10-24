import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { OrderResponseDTO } from "@/services/api.order";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSendOrderEmail } from "@/hooks/useOrders";

type EnviarPropostaModalProps = {
  order: OrderResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EnviarPropostaModal = ({
  order,
  open,
  onOpenChange,
}: EnviarPropostaModalProps) => {
  const [destinatario, setDestinatario] = useState<"cliente" | "outro">(
    "cliente"
  );
  const [emailCustomizado, setEmailCustomizado] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  const sendEmailMutation = useSendOrderEmail();

  const handleEnviar = async () => {
    if (!order) return;

    // Validações
    if (destinatario === "outro" && !emailCustomizado) {
      toast.error("Por favor, informe o email do destinatário");
      return;
    }

    if (!assunto.trim()) {
      toast.error("Por favor, informe o assunto do email");
      return;
    }

    const emailDestino =
      destinatario === "cliente" ? order.customer.email : emailCustomizado;

    // Enviar email via API
    sendEmailMutation.mutate(
      {
        orderId: order.id,
        emailData: {
          to: emailDestino,
          subject: assunto,
          body: mensagem,
        },
      },
      {
        onSuccess: () => {
          // Resetar formulário
          setDestinatario("cliente");
          setEmailCustomizado("");
          setAssunto("");
          setMensagem("");
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Resetar formulário ao fechar
      setDestinatario("cliente");
      setEmailCustomizado("");
      setAssunto("");
      setMensagem("");
    }
    onOpenChange(open);
  };

  if (!order) return null;

  // Preencher assunto padrão quando o modal abre
  if (open && !assunto) {
    setAssunto(`Proposta Comercial - Pedido ${order.orderNumber}`);
    setMensagem(
      `Prezado(a) ${
        order.customer.name
      },\n\nSegue em anexo a proposta comercial referente ao pedido ${
        order.orderNumber
      }.\n\nValor total: ${order.totalAmount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}\n\nFicamos à disposição para quaisquer esclarecimentos.\n\nAtenciosamente,\n${
        order.employee.name
      }`
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Proposta por Email
          </DialogTitle>
          <DialogDescription>
            Envie a proposta do pedido {order.orderNumber} para o cliente ou
            outro destinatário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Seletor de Destinatário */}
          <div className="space-y-3">
            <Label>Destinatário</Label>
            <RadioGroup
              value={destinatario}
              onValueChange={(value) =>
                setDestinatario(value as "cliente" | "outro")
              }
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="cliente" id="cliente" />
                <Label
                  htmlFor="cliente"
                  className="flex-1 cursor-pointer font-normal"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.email}
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="outro" id="outro" />
                <Label
                  htmlFor="outro"
                  className="flex-1 cursor-pointer font-normal"
                >
                  Outro destinatário
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Campo de Email Customizado */}
          {destinatario === "outro" && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label htmlFor="email-customizado">Email do Destinatário</Label>
              <Input
                id="email-customizado"
                type="email"
                placeholder="exemplo@email.com"
                value={emailCustomizado}
                onChange={(e) => setEmailCustomizado(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Assunto */}
          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto</Label>
            <Input
              id="assunto"
              placeholder="Assunto do email"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              placeholder="Digite a mensagem do email..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={8}
              className="w-full resize-none"
            />
          </div>

          {/* Informações do Pedido */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">Resumo do Pedido</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Número:</span>{" "}
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Valor:</span>{" "}
                <span className="font-medium">
                  {order.totalAmount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Itens:</span>{" "}
                <span className="font-medium">{order.items.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className="font-medium">{order.orderStatus}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={sendEmailMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnviar}
            disabled={sendEmailMutation.isPending}
            className="gap-2"
          >
            {sendEmailMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Proposta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
