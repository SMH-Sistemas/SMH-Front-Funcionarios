import { useState } from "react";
import { Plus, Search, Loader2, MapPin, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Cliente } from "@/types/saida";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/hooks/useCustomers";
import {
  applyCpfCnpjMask,
  applyPhoneMask,
  applyCepMask,
  removeMask,
  fetchAddressByCep,
} from "@/utils/masks";
import { toast } from "sonner";

type ClienteStepProps = {
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente) => void;
};

export const ClienteStep = ({
  selectedCliente,
  onSelectCliente,
}: ClienteStepProps) => {
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers();

  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [tipoCliente, setTipoCliente] = useState<"fisica" | "juridica">(
    "fisica"
  );
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

  // Converter customers da API para formato Cliente
  const clientes: Cliente[] =
    customersData?.map((customer) => ({
      id: customer.id,
      nome: customer.name,
      sobrenome: customer.surname || "",
      cpfCnpj: customer.fiscalIdentification,
      telefone: customer.phoneNumber,
      email: customer.email,
      senha: "",
      endereco: {
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
      },
    })) || [];

  // Buscar endereço pelo CEP
  const handleCepChange = async (cep: string) => {
    const maskedCep = applyCepMask(cep);
    setNovoCliente({
      ...novoCliente,
      endereco: { ...novoCliente.endereco, cep: maskedCep },
    });

    const cleanCep = removeMask(maskedCep);
    if (cleanCep.length === 8) {
      setIsLoadingCep(true);
      const address = await fetchAddressByCep(cleanCep);
      setIsLoadingCep(false);

      if (address) {
        setNovoCliente({
          ...novoCliente,
          endereco: {
            ...novoCliente.endereco,
            cep: maskedCep,
            rua: address.logradouro,
            bairro: address.bairro,
            cidade: address.localidade,
            estado: address.uf,
          },
        });
        toast.success("Endereço encontrado!");
      } else {
        toast.error("CEP não encontrado. Verifique e tente novamente.");
      }
    }
  };

  // Filtrar clientes
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cpfCnpj.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCliente = () => {
    const cliente: Cliente = {
      id: Date.now().toString(),
      nome: novoCliente.nome || "",
      sobrenome: novoCliente.sobrenome || "",
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
          <Button variant="ghost" onClick={() => setShowNovoCliente(false)}>
            Voltar
          </Button>
        </div>

        {/* Seleção do Tipo de Cliente */}
        <Card className="p-4 bg-muted/50">
          <Label className="text-base font-semibold mb-3 block">
            Tipo de Cliente *
          </Label>
          <RadioGroup
            value={tipoCliente}
            onValueChange={(value: "fisica" | "juridica") => {
              setTipoCliente(value);
              // Limpar sobrenome se mudar para jurídica
              if (value === "juridica") {
                setNovoCliente({ ...novoCliente, sobrenome: "" });
              }
            }}
            className="grid grid-cols-2 gap-3"
          >
            <div
              className={`flex items-center space-x-3 rounded-lg border-2 p-3 transition-all ${
                tipoCliente === "fisica"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="fisica" id="fisica" />
              <Label
                htmlFor="fisica"
                className="flex items-center gap-2 cursor-pointer font-normal flex-1"
              >
                <User className="h-4 w-4 text-primary" />
                <span>Pessoa Física</span>
              </Label>
            </div>
            <div
              className={`flex items-center space-x-3 rounded-lg border-2 p-3 transition-all ${
                tipoCliente === "juridica"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="juridica" id="juridica" />
              <Label
                htmlFor="juridica"
                className="flex items-center gap-2 cursor-pointer font-normal flex-1"
              >
                <Building2 className="h-4 w-4 text-primary" />
                <span>Pessoa Jurídica</span>
              </Label>
            </div>
          </RadioGroup>
          {tipoCliente === "fisica" ? (
            <p className="text-xs text-muted-foreground mt-2">
              <User className="h-3 w-3 inline mr-1" />
              Para pessoas físicas, será necessário informar CPF e sobrenome.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">
              <Building2 className="h-3 w-3 inline mr-1" />
              Para empresas, informe CNPJ e razão social (sobrenome não é
              necessário).
            </p>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              {tipoCliente === "fisica" ? "Nome *" : "Razão Social *"}
            </Label>
            <Input
              value={novoCliente.nome || ""}
              onChange={(e) =>
                setNovoCliente({ ...novoCliente, nome: e.target.value })
              }
              placeholder={
                tipoCliente === "fisica"
                  ? "Digite o nome"
                  : "Digite a razão social"
              }
            />
          </div>

          {tipoCliente === "fisica" && (
            <div>
              <Label>Sobrenome *</Label>
              <Input
                value={novoCliente.sobrenome || ""}
                onChange={(e) =>
                  setNovoCliente({ ...novoCliente, sobrenome: e.target.value })
                }
                placeholder="Digite o sobrenome"
              />
            </div>
          )}

          <div className={tipoCliente === "juridica" ? "col-span-2" : ""}>
            <Label>{tipoCliente === "fisica" ? "CPF *" : "CNPJ *"}</Label>
            <Input
              value={novoCliente.cpfCnpj || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  cpfCnpj: applyCpfCnpjMask(e.target.value),
                })
              }
              placeholder={
                tipoCliente === "fisica"
                  ? "000.000.000-00"
                  : "00.000.000/0000-00"
              }
              maxLength={18}
            />
          </div>

          <div>
            <Label>Telefone *</Label>
            <Input
              value={novoCliente.telefone || ""}
              onChange={(e) =>
                setNovoCliente({
                  ...novoCliente,
                  telefone: applyPhoneMask(e.target.value),
                })
              }
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>

          <div>
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

          <div>
            <Label>Senha *</Label>
            <Input
              type="password"
              value={novoCliente.senha || ""}
              onChange={(e) =>
                setNovoCliente({ ...novoCliente, senha: e.target.value })
              }
              placeholder="Digite uma senha"
              minLength={6}
            />
          </div>

          <div className="col-span-2">
            <h4 className="font-semibold mb-2">Endereço</h4>
          </div>

          <div>
            <Label>CEP *</Label>
            <div className="relative">
              <Input
                value={novoCliente.endereco?.cep || ""}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                disabled={isLoadingCep}
              />
              {isLoadingCep && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!isLoadingCep && novoCliente.endereco?.cep && (
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-green-600" />
              )}
            </div>
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

  // Mostra a lista de clientes cadastrados (sempre visível, exceto ao criar novo)
  return (
    <div className="space-y-4">
      {/* Cliente selecionado - resumo no topo */}
      {selectedCliente && (
        <Card className="p-4 bg-primary/5 border-primary">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-primary mb-1">
                Cliente Selecionado ✓
              </div>
              <div className="font-semibold">
                {selectedCliente.nome} {selectedCliente.sobrenome}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedCliente.email} • {selectedCliente.telefone}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectCliente(null)}
            >
              Alterar
            </Button>
          </div>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Selecione um Cliente
            {!isLoadingCustomers && clientes.length > 0 && (
              <span className="ml-2 text-primary">
                ({filteredClientes.length} de {clientes.length})
              </span>
            )}
          </h3>
        </div>
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
      </div>

      {isLoadingCustomers ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Carregando clientes...
          </span>
        </div>
      ) : filteredClientes.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-3">
            <div className="flex justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">
              {searchTerm
                ? "Nenhum cliente encontrado"
                : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Tente buscar com outros termos ou cadastre um novo cliente."
                : "Comece cadastrando seu primeiro cliente."}
            </p>
            <Button onClick={() => setShowNovoCliente(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Novo Cliente
            </Button>
          </div>
        </Card>
      ) : (
        <RadioGroup
          value={selectedCliente?.id}
          onValueChange={(value) => {
            const cliente = filteredClientes.find((c) => c.id === value);
            if (cliente) onSelectCliente(cliente);
          }}
        >
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredClientes.map((cliente) => {
              const isSelected = selectedCliente?.id === cliente.id;
              return (
                <Card
                  key={cliente.id}
                  className={`p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={cliente.id} id={cliente.id} />
                    <div className="flex-1">
                      <Label htmlFor={cliente.id} className="cursor-pointer">
                        <div className="font-semibold flex items-center gap-2">
                          {cliente.nome} {cliente.sobrenome}
                          {isSelected && (
                            <span className="text-xs font-normal text-primary">
                              ✓ Selecionado
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {cliente.cpfCnpj} • {cliente.telefone}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {cliente.email}
                        </div>
                      </Label>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </RadioGroup>
      )}
    </div>
  );
};
