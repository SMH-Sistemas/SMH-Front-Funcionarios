import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Cliente, ItemSaida } from "@/types/saida";

type ResumoStepProps = {
  cliente: Cliente;
  itens: ItemSaida[];
  dadosEnvio: {
    enderecoEntrega: Cliente["endereco"];
    transportadora?: string;
    numeroRastreio?: string;
    dataPrevista?: string;
    observacoes?: string;
  };
};

export const ResumoStep = ({ cliente, itens, dadosEnvio }: ResumoStepProps) => {
  const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const impostos = subtotal * 0.15; // Mock de impostos (15%)
  const total = subtotal + impostos;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Cliente</h3>
        <div className="text-sm space-y-1">
          <p className="font-medium">{cliente.nome}</p>
          <p className="text-muted-foreground">{cliente.cpfCnpj}</p>
          <p className="text-muted-foreground">
            {cliente.telefone} • {cliente.email}
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
        <div className="text-sm text-muted-foreground">
          <p>
            {dadosEnvio.enderecoEntrega.rua}, {dadosEnvio.enderecoEntrega.numero}
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

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Itens da Saída</h3>
        <div className="space-y-2">
          {itens.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm pb-2 border-b last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium">{item.nome}</p>
                <p className="text-muted-foreground text-xs">
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
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>
              {subtotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Impostos (15%):</span>
            <span>
              {impostos.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
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
