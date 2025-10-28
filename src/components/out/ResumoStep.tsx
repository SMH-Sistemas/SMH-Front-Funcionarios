import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Cliente, ItemSaida, VendedorPedido } from "@/types/saida";
import { FileText, DollarSign } from "lucide-react";

type ResumoStepProps = {
  cliente: Cliente;
  itens: ItemSaida[];
  vendedor?: VendedorPedido | null;
  valorTotalPedido: number; // Já calculado incluindo impostos
  dadosEnvio: {
    enderecoEntrega: Cliente["endereco"];
    transportadora?: string;
    numeroRastreio?: string;
    dataPrevista?: string;
    observacoes?: string;
  };
};

export const ResumoStep = ({
  cliente,
  itens,
  vendedor,
  valorTotalPedido,
  dadosEnvio,
}: ResumoStepProps) => {
  const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const impostosTotais = itens.reduce(
    (sum, item) => sum + ((item as ItemSaida).taxValue || 0),
    0
  );
  const total = valorTotalPedido;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Cliente</h3>
        <div className="text-sm space-y-1">
          <p className="font-medium">
            {cliente.nome} {cliente.sobrenome}
          </p>
          <p className="text-muted-foreground">{cliente.cpfCnpj}</p>
          <p className="text-muted-foreground">
            {cliente.telefone} • {cliente.email}
          </p>
        </div>
      </Card>

      {vendedor && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Vendedor</h3>
          <div className="text-sm space-y-1">
            <p className="font-medium">
              {vendedor.nome} {vendedor.sobrenome}
            </p>
            <p className="text-muted-foreground">{vendedor.email}</p>
            {vendedor.telefone && (
              <p className="text-muted-foreground">{vendedor.telefone}</p>
            )}
            <p className="text-primary font-semibold">
              Comissão: {vendedor.comissao}% sobre o total
            </p>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
        <div className="text-sm text-muted-foreground">
          <p>
            {dadosEnvio.enderecoEntrega.rua},{" "}
            {dadosEnvio.enderecoEntrega.numero}
            {dadosEnvio.enderecoEntrega.complemento &&
              ` - ${dadosEnvio.enderecoEntrega.complemento}`}
          </p>
          <p>
            {dadosEnvio.enderecoEntrega.bairro} -{" "}
            {dadosEnvio.enderecoEntrega.cidade}/
            {dadosEnvio.enderecoEntrega.estado}
          </p>
          <p>CEP: {dadosEnvio.enderecoEntrega.cep}</p>
        </div>
      </Card>

      {(dadosEnvio.transportadora || dadosEnvio.numeroRastreio) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Transporte</h3>
          <div className="text-sm space-y-1">
            {dadosEnvio.transportadora && (
              <p className="text-muted-foreground">
                Transportadora: {dadosEnvio.transportadora}
              </p>
            )}
            {dadosEnvio.numeroRastreio && (
              <p className="text-muted-foreground">
                Rastreio: {dadosEnvio.numeroRastreio}
              </p>
            )}
            {dadosEnvio.dataPrevista && (
              <p className="text-muted-foreground">
                Entrega prevista:{" "}
                {new Date(dadosEnvio.dataPrevista).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Itens do Pedido */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Itens do Pedido
        </h3>
        <div className="space-y-3">
          {itens.map((item) => {
            const itemWithTax = item as ItemSaida;
            return (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-muted/30 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">{item.nome}</p>
                    <p className="text-muted-foreground text-xs">
                      SKU: {item.sku}
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
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Qtd:</span>{" "}
                    <span className="font-medium">{item.quantidade}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unit.:</span>{" "}
                    <span className="font-medium">
                      {item.precoUnitario.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  {itemWithTax.taxValue && itemWithTax.taxValue > 0 && (
                    <div>
                      <span className="text-muted-foreground">Imposto:</span>{" "}
                      <span className="font-medium text-orange-600">
                        {itemWithTax.taxValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  )}
                </div>
                {itemWithTax.taxPercentage && itemWithTax.taxPercentage > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Alíquota: {itemWithTax.taxPercentage}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Resumo Financeiro
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-semibold">
              {subtotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
          {impostosTotais > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de Impostos:</span>
              <span className="font-semibold text-orange-600">
                +{" "}
                {impostosTotais.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Valor Total:</span>
            <span className="text-primary">
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </div>
      </Card>

      {dadosEnvio.observacoes && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Observações</h3>
          <p className="text-sm text-muted-foreground">
            {dadosEnvio.observacoes}
          </p>
        </Card>
      )}
    </div>
  );
};
