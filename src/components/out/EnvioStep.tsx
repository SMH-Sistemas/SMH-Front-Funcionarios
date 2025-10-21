import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Cliente } from "@/types/saida";

type EnvioStepProps = {
  cliente: Cliente;
  dadosEnvio: {
    enderecoEntrega: Cliente["endereco"];
    transportadora?: string;
    numeroRastreio?: string;
    dataPrevista?: string;
    observacoes?: string;
  };
  onUpdateDadosEnvio: (dados: any) => void;
};

export const EnvioStep = ({
  cliente,
  dadosEnvio,
  onUpdateDadosEnvio,
}: EnvioStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Endereço de Entrega</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>CEP</Label>
            <Input
              value={dadosEnvio.enderecoEntrega.cep}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  enderecoEntrega: {
                    ...dadosEnvio.enderecoEntrega,
                    cep: e.target.value,
                  },
                })
              }
              placeholder="00000-000"
            />
          </div>

          <div>
            <Label>Rua</Label>
            <Input
              value={dadosEnvio.enderecoEntrega.rua}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  enderecoEntrega: {
                    ...dadosEnvio.enderecoEntrega,
                    rua: e.target.value,
                  },
                })
              }
              placeholder="Nome da rua"
            />
          </div>

          <div>
            <Label>Número</Label>
            <Input
              value={dadosEnvio.enderecoEntrega.numero}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  enderecoEntrega: {
                    ...dadosEnvio.enderecoEntrega,
                    numero: e.target.value,
                  },
                })
              }
              placeholder="123"
            />
          </div>

          <div>
            <Label>Complemento</Label>
            <Input
              value={dadosEnvio.enderecoEntrega.complemento || ""}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  enderecoEntrega: {
                    ...dadosEnvio.enderecoEntrega,
                    complemento: e.target.value,
                  },
                })
              }
              placeholder="Apto, sala, etc"
            />
          </div>

          <div>
            <Label>Bairro</Label>
            <Input
              value={dadosEnvio.enderecoEntrega.bairro}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  enderecoEntrega: {
                    ...dadosEnvio.enderecoEntrega,
                    bairro: e.target.value,
                  },
                })
              }
              placeholder="Nome do bairro"
            />
          </div>

          <div>
            <Label>Cidade</Label>
            <Input
              value={dadosEnvio.enderecoEntrega.cidade}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  enderecoEntrega: {
                    ...dadosEnvio.enderecoEntrega,
                    cidade: e.target.value,
                  },
                })
              }
              placeholder="Nome da cidade"
            />
          </div>

          <div>
            <Label>Estado</Label>
            <Input
              value={dadosEnvio.enderecoEntrega.estado}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  enderecoEntrega: {
                    ...dadosEnvio.enderecoEntrega,
                    estado: e.target.value,
                  },
                })
              }
              placeholder="UF"
              maxLength={2}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Dados do Transporte</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Transportadora</Label>
            <Input
              value={dadosEnvio.transportadora || ""}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  transportadora: e.target.value,
                })
              }
              placeholder="Nome da transportadora"
            />
          </div>

          <div>
            <Label>Número de Rastreio</Label>
            <Input
              value={dadosEnvio.numeroRastreio || ""}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  numeroRastreio: e.target.value,
                })
              }
              placeholder="BR000000000BR"
            />
          </div>

          <div className="col-span-2">
            <Label>Data Prevista de Entrega</Label>
            <Input
              type="date"
              value={dadosEnvio.dataPrevista || ""}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  dataPrevista: e.target.value,
                })
              }
            />
          </div>

          <div className="col-span-2">
            <Label>Observações</Label>
            <Textarea
              value={dadosEnvio.observacoes || ""}
              onChange={(e) =>
                onUpdateDadosEnvio({
                  ...dadosEnvio,
                  observacoes: e.target.value,
                })
              }
              placeholder="Informações adicionais sobre a entrega"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
