import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Cliente } from "@/types/saida";
import { mockClientes } from "@/data/mockSaidas";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type ClienteStepProps = {
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente) => void;
};

export const ClienteStep = ({
  selectedCliente,
  onSelectCliente,
}: ClienteStepProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({
    endereco: {
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    },
  });

  const filteredClientes = mockClientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cpfCnpj.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCliente = () => {
    const cliente: Cliente = {
      id: Date.now().toString(),
      nome: novoCliente.nome || "",
      cpfCnpj: novoCliente.cpfCnpj || "",
      telefone: novoCliente.telefone || "",
      email: novoCliente.email || "",
      endereco: {
        rua: novoCliente.endereco?.rua || "",
        numero: novoCliente.endereco?.numero || "",
        complemento: novoCliente.endereco?.complemento,
        bairro: novoCliente.endereco?.bairro || "",
        cidade: novoCliente.endereco?.cidade || "",
        estado: novoCliente.endereco?.estado || "",
        cep: novoCliente.endereco?.cep || "",
      },
      observacoes: novoCliente.observacoes,
    };
    onSelectCliente(cliente);
    setShowNovoCliente(false);
    setNovoCliente({
      endereco: {
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
      },
    });
  };

  if (showNovoCliente) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Novo Cliente</h3>
          <Button
            variant="ghost"
            onClick={() => setShowNovoCliente(false)}
          >
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Nome / Razão Social *</Label>
            <Input
              value={novoCliente.nome || ""}
              onChange={(e) =>
                setNovoCliente({ ...novoCliente, nome: e.target.value })
              }
              placeholder="Digite o nome"
            />
          </div>

          <div>
            <Label>CPF / CNPJ *</Label>
            <Input
              value={novoCliente.cpfCnpj || ""}
              onChange={(e) =>
                setNovoCliente({ ...novoCliente, cpfCnpj: e.target.value })
              }
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <Label>Telefone *</Label>
            <Input
              value={novoCliente.telefone || ""}
              onChange={(e) =>
                setNovoCliente({ ...novoCliente, telefone: e.target.value })
              }
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="col-span-2">
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={novoCliente.email || ""}
              onChange={(e) =>
                setNovoCliente({ ...novoCliente, email: e.target.value })
              }
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="col-span-2">
            <h4 className="font-semibold mb-2">Endereço</h4>
          </div>

          <div>
            <Label>CEP *</Label>
            <Input
              value={novoCliente.endereco?.cep || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  endereco: { ...novoCliente.endereco, cep: e.target.value },
                })
              }
              placeholder="00000-000"
            />
          </div>

          <div>
            <Label>Rua *</Label>
            <Input
              value={novoCliente.endereco?.rua || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  endereco: { ...novoCliente.endereco, rua: e.target.value },
                })
              }
              placeholder="Nome da rua"
            />
          </div>

          <div>
            <Label>Número *</Label>
            <Input
              value={novoCliente.endereco?.numero || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  endereco: { ...novoCliente.endereco, numero: e.target.value },
                })
              }
              placeholder="123"
            />
          </div>

          <div>
            <Label>Complemento</Label>
            <Input
              value={novoCliente.endereco?.complemento || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  endereco: {
                    ...novoCliente.endereco,
                    complemento: e.target.value,
                  },
                })
              }
              placeholder="Apto, sala, etc"
            />
          </div>

          <div>
            <Label>Bairro *</Label>
            <Input
              value={novoCliente.endereco?.bairro || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  endereco: { ...novoCliente.endereco, bairro: e.target.value },
                })
              }
              placeholder="Nome do bairro"
            />
          </div>

          <div>
            <Label>Cidade *</Label>
            <Input
              value={novoCliente.endereco?.cidade || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  endereco: { ...novoCliente.endereco, cidade: e.target.value },
                })
              }
              placeholder="Nome da cidade"
            />
          </div>

          <div>
            <Label>Estado *</Label>
            <Input
              value={novoCliente.endereco?.estado || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  endereco: { ...novoCliente.endereco, estado: e.target.value },
                })
              }
              placeholder="UF"
              maxLength={2}
            />
          </div>

          <div className="col-span-2">
            <Label>Observações</Label>
            <Textarea
              value={novoCliente.observacoes || ""}
              onChange={(e) =>
                setNovoCliente({ ...novoCliente, observacoes: e.target.value })
              }
              placeholder="Informações adicionais"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreateCliente}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Cliente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowNovoCliente(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <RadioGroup
        value={selectedCliente?.id}
        onValueChange={(value) => {
          const cliente = filteredClientes.find((c) => c.id === value);
          if (cliente) onSelectCliente(cliente);
        }}
      >
        <div className="space-y-2">
          {filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="p-4">
              <div className="flex items-start gap-3">
                <RadioGroupItem value={cliente.id} id={cliente.id} />
                <div className="flex-1">
                  <Label htmlFor={cliente.id} className="cursor-pointer">
                    <div className="font-semibold">{cliente.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {cliente.cpfCnpj} • {cliente.telefone}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cliente.email}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {cliente.endereco.rua}, {cliente.endereco.numero} -{" "}
                      {cliente.endereco.bairro}, {cliente.endereco.cidade}/
                      {cliente.endereco.estado}
                    </div>
                  </Label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};
