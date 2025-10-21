import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cliente, ItemSaida, Saida } from "@/types/saida";
import { ClienteStep } from "./ClienteStep";
import { ItensStep } from "./ItensStep";
import { EnvioStep } from "./EnvioStep";
import { ResumoStep } from "./ResumoStep";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type NovaSaidaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (saida: Saida) => void;
};

export const NovaSaidaModal = ({
  open,
  onOpenChange,
  onSave,
}: NovaSaidaModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [itens, setItens] = useState<ItemSaida[]>([]);
  const [dadosEnvio, setDadosEnvio] = useState<any>({
    enderecoEntrega: {},
  });

  const steps = [
    { number: 1, title: "Cliente" },
    { number: 2, title: "Itens" },
    { number: 3, title: "Envio" },
    { number: 4, title: "Resumo" },
  ];

  const progress = (step / steps.length) * 100;

  const handleNext = () => {
    if (step === 1 && !selectedCliente) {
      toast({
        title: "Atenção",
        description: "Selecione ou cadastre um cliente",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && itens.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos um item",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSave = (status: "rascunho" | "reservado") => {
    if (!selectedCliente) return;

    const novaSaida: Saida = {
      id: Date.now().toString(),
      numero: `SAI-2025-${String(Date.now()).slice(-3)}`,
      data: new Date().toISOString(),
      cliente: selectedCliente,
      itens,
      valorTotal: itens.reduce((sum, item) => sum + item.subtotal, 0),
      status,
      responsavel: "Usuário Atual", // Mock
      tipoSaida: "venda",
      dadosEnvio,
      timeline: [
        {
          status,
          data: new Date().toISOString(),
          responsavel: "Usuário Atual",
          observacao: `Saída ${status === "rascunho" ? "criada como rascunho" : "criada e reservada"}`,
        },
      ],
      logs: [
        {
          id: "1",
          data: new Date().toISOString(),
          usuario: "Usuário Atual",
          acao: "Criação",
          detalhes: `Saída criada com ${itens.length} itens - Status: ${status}`,
        },
      ],
    };

    onSave(novaSaida);
    toast({
      title: "Sucesso!",
      description: `Saída ${novaSaida.numero} ${status === "rascunho" ? "salva como rascunho" : "reservada com sucesso"}`,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCliente(null);
    setItens([]);
    setDadosEnvio({ enderecoEntrega: {} });
    onOpenChange(false);
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDadosEnvio({
      ...dadosEnvio,
      enderecoEntrega: cliente.endereco,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nova Saída de Produtos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      step >= s.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.number}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step >= s.number ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="h-0.5 flex-1 bg-muted mx-2" />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {step === 1 && (
            <ClienteStep
              selectedCliente={selectedCliente}
              onSelectCliente={handleSelectCliente}
            />
          )}
          {step === 2 && (
            <ItensStep itens={itens} onUpdateItens={setItens} />
          )}
          {step === 3 && selectedCliente && (
            <EnvioStep
              cliente={selectedCliente}
              dadosEnvio={dadosEnvio}
              onUpdateDadosEnvio={setDadosEnvio}
            />
          )}
          {step === 4 && selectedCliente && (
            <ResumoStep
              cliente={selectedCliente}
              itens={itens}
              dadosEnvio={dadosEnvio}
            />
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 4 ? (
              <Button onClick={handleNext}>Próximo</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleSave("rascunho")}>
                  Salvar Rascunho
                </Button>
                <Button onClick={() => handleSave("reservado")}>
                  Reservar e Finalizar
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
