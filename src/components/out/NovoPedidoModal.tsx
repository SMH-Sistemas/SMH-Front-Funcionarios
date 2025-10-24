import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cliente, ItemSaida, VendedorPedido } from "@/types/saida";
import type { OrderRequestDTO, OrderResponseDTO } from "@/services/api.order";
import { ClienteStep } from "./ClienteStep";
import { ItensStep } from "./ItensStep";
import { EnvioStep } from "./EnvioStep";
import { VendedorStep } from "./VendedorStep";
import { ResumoStep } from "./ResumoStep";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTaxes } from "@/hooks/useTaxes";

type NovoPedidoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (orderData: OrderRequestDTO) => void;
  editOrder?: OrderResponseDTO | null;
};

export const NovoPedidoModal = ({
  open,
  onOpenChange,
  onSave,
  editOrder,
}: NovoPedidoModalProps) => {
  const { toast } = useToast();
  const { data: taxes = [] } = useTaxes();

  const [step, setStep] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [itens, setItens] = useState<ItemSaida[]>([]);
  const [selectedTaxId, setSelectedTaxId] = useState<number | null>(null);
  const [vendedor, setVendedor] = useState<VendedorPedido | null>(null);
  const [dadosEnvio, setDadosEnvio] = useState<any>({
    enderecoEntrega: {},
  });

  // Preencher dados quando estiver editando
  useEffect(() => {
    if (editOrder && open) {
      // Converter OrderResponseDTO para o formato local
      const cliente: Cliente = {
        id: editOrder.customer.id,
        nome: editOrder.customer.name,
        sobrenome: "",
        cpfCnpj: "",
        telefone: editOrder.customer.phone,
        email: editOrder.customer.email,
        senha: "",
        endereco: {
          rua: editOrder.deliveryAddress.street,
          numero: editOrder.deliveryAddress.number,
          complemento: editOrder.deliveryAddress.complement || "",
          bairro: editOrder.deliveryAddress.district,
          cidade: editOrder.deliveryAddress.city,
          estado: editOrder.deliveryAddress.state,
          cep: editOrder.deliveryAddress.cep,
        },
      };

      const vendedorData: VendedorPedido = {
        id: editOrder.employee.id,
        nome: editOrder.employee.name,
        sobrenome: "",
        email: editOrder.employee.email,
        telefone: "",
        senha: "",
        saldoComissao: 0,
      };

      const itensData: ItemSaida[] = editOrder.items.map((item) => ({
        id: item.id.toString(),
        produtoNome: item.productName,
        sku: item.productNcm,
        quantidade: item.quantity,
        precoUnitario: item.unitPrice,
        subtotal: item.subtotal,
        taxId: undefined,
        taxPercentage: undefined,
        taxValue: item.taxValue,
        productType: "PRODUCT",
        quantidadeDisponivel: item.quantity,
      }));

      setSelectedCliente(cliente);
      setVendedor(vendedorData);
      setItens(itensData);
      setDadosEnvio({
        enderecoEntrega: cliente.endereco,
        transportadora: editOrder.transportInfo.carrierName,
        codigoRastreio: editOrder.transportInfo.trackingCode || "",
        dataPrevisaoEntrega: editOrder.transportInfo.expectedDeliveryDate,
      });
    }
  }, [editOrder, open]);

  // Buscar imposto selecionado e calcular valor total do pedido
  const selectedTax = taxes.find((tax) => tax.id === selectedTaxId);
  const valorSubtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const valorImposto = selectedTax
    ? (valorSubtotal * selectedTax.percentage) / 100
    : 0;
  const valorTotal = valorSubtotal + valorImposto;

  const steps = [
    { number: 1, title: "Cliente" },
    { number: 2, title: "Itens" },
    { number: 3, title: "Vendedor" },
    { number: 4, title: "Envio" },
    { number: 5, title: "Resumo" },
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
    if (step === 1 && selectedCliente && !selectedCliente.nome) {
      toast({
        title: "Atenção",
        description: "Preencha o nome do cliente",
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
    if (step === 3 && !vendedor) {
      toast({
        title: "Atenção",
        description: "Informe os dados do vendedor",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && vendedor && (!vendedor.nome || !vendedor.email)) {
      toast({
        title: "Atenção",
        description: "Preencha o nome e e-mail do vendedor",
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
    if (!selectedCliente || !vendedor || !dadosEnvio.enderecoEntrega) {
      toast({
        title: "Erro",
        description: "Preencha todos os dados obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Montar OrderRequestDTO conforme esperado pelo backend
    const orderData: OrderRequestDTO = {
      customer: {
        name: selectedCliente.nome,
        surname: selectedCliente.sobrenome || "",
        email: selectedCliente.email,
        password: selectedCliente.senha || "temp123", // Senha temporária se não fornecida
        fiscalIdentification: selectedCliente.cpfCnpj,
        phoneNumber: selectedCliente.telefone,
      },
      employee: {
        name: vendedor.nome,
        surname: vendedor.sobrenome || "",
        email: vendedor.email,
        password: vendedor.senha || "temp123", // Senha temporária se não fornecida
        commissionBalance: vendedor.comissao,
        phoneNumber: vendedor.telefone || "",
      },
      clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      orderStatus: "PENDING", // Status inicial do pedido
      taxId: selectedTaxId,
      deliveryAddress: {
        street: dadosEnvio.enderecoEntrega.rua || selectedCliente.endereco.rua,
        number:
          dadosEnvio.enderecoEntrega.numero || selectedCliente.endereco.numero,
        complement:
          dadosEnvio.enderecoEntrega.complemento ||
          selectedCliente.endereco.complemento,
        district:
          dadosEnvio.enderecoEntrega.bairro || selectedCliente.endereco.bairro,
        city:
          dadosEnvio.enderecoEntrega.cidade || selectedCliente.endereco.cidade,
        state:
          dadosEnvio.enderecoEntrega.estado || selectedCliente.endereco.estado,
        cep: dadosEnvio.enderecoEntrega.cep || selectedCliente.endereco.cep,
      },
      transportInfo: {
        carrierName: dadosEnvio.transportadora || "A definir",
        trackingCode: dadosEnvio.numeroRastreio || "",
        expectedDeliveryDate:
          dadosEnvio.dataPrevista || new Date().toISOString().split("T")[0],
      },
      items: itens.map((item) => ({
        product: {
          productId: parseInt(item.produtoId) || undefined,
          name: item.nome,
          description: "",
          ncm: item.sku,
          stockQuantity: item.quantidadeDisponivel,
          cost: 0,
          profitMargin: 0,
          price: item.precoUnitario,
          category: "",
          type: item.productType || "PRODUCT",
          status: "AVAILABLE",
        },
        quantity: item.quantidade,
        taxId: item.taxId || null,
      })),
    };

    onSave(orderData);
    toast({
      title: "Sucesso!",
      description: "Pedido criado com sucesso!",
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCliente(null);
    setItens([]);
    setSelectedTaxId(null);
    setVendedor(null);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>
            {editOrder ? "Editar Pedido" : "Novo Pedido"}
          </DialogTitle>
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
                      step >= s.number
                        ? "text-foreground"
                        : "text-muted-foreground"
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
            <ItensStep
              itens={itens}
              onUpdateItens={setItens}
              selectedTaxId={selectedTaxId}
              onSelectTax={setSelectedTaxId}
            />
          )}
          {step === 3 && (
            <VendedorStep
              vendedor={vendedor}
              onUpdateVendedor={setVendedor}
              valorTotalPedido={valorTotal}
            />
          )}
          {step === 4 && selectedCliente && (
            <EnvioStep
              cliente={selectedCliente}
              dadosEnvio={dadosEnvio}
              onUpdateDadosEnvio={setDadosEnvio}
            />
          )}
          {step === 5 && selectedCliente && (
            <ResumoStep
              cliente={selectedCliente}
              itens={itens}
              vendedor={vendedor}
              valorTotalPedido={valorTotal}
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
            {step < 5 ? (
              <Button onClick={handleNext}>Próximo</Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave("rascunho")}
                >
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
