import { useState } from "react";
import { User, Mail, Phone, Percent, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { VendedorPedido } from "@/types/saida";
import { applyPhoneMask } from "@/utils/masks";

type VendedorStepProps = {
  vendedor: VendedorPedido | null;
  onUpdateVendedor: (vendedor: VendedorPedido) => void;
  valorTotalPedido: number;
};

export const VendedorStep = ({
  vendedor,
  onUpdateVendedor,
  valorTotalPedido,
}: VendedorStepProps) => {
  const [formData, setFormData] = useState<VendedorPedido>(
    vendedor || {
      nome: "",
      sobrenome: "",
      email: "",
      telefone: "",
      senha: "",
      comissao: 0,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: keyof VendedorPedido,
    value: string | number
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onUpdateVendedor(newFormData);

    // Validação em tempo real
    const newErrors = { ...errors };
    if (field === "nome" && !value) {
      newErrors.nome = "Nome é obrigatório";
    } else if (field === "nome") {
      delete newErrors.nome;
    }

    if (field === "sobrenome" && !value) {
      newErrors.sobrenome = "Sobrenome é obrigatório";
    } else if (field === "sobrenome") {
      delete newErrors.sobrenome;
    }

    if (field === "email" && !value) {
      newErrors.email = "E-mail é obrigatório";
    } else if (field === "email" && !/\S+@\S+\.\S+/.test(value as string)) {
      newErrors.email = "E-mail inválido";
    } else if (field === "email") {
      delete newErrors.email;
    }

    if (field === "comissao" && (value < 0 || value > 100)) {
      newErrors.comissao = "Comissão deve estar entre 0% e 100%";
    } else if (field === "comissao") {
      delete newErrors.comissao;
    }

    setErrors(newErrors);
  };

  const valorComissao = (valorTotalPedido * formData.comissao) / 100;

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Informe os dados do vendedor responsável por este pedido e a
          porcentagem de comissão sobre o valor total.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do Vendedor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome *
            </Label>
            <Input
              id="nome"
              placeholder="Digite o nome do vendedor"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome}</p>
            )}
          </div>

          {/* Sobrenome */}
          <div className="space-y-2">
            <Label htmlFor="sobrenome" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Sobrenome *
            </Label>
            <Input
              id="sobrenome"
              placeholder="Digite o sobrenome do vendedor"
              value={formData.sobrenome}
              onChange={(e) => handleChange("sobrenome", e.target.value)}
              className={errors.sobrenome ? "border-red-500" : ""}
            />
            {errors.sobrenome && (
              <p className="text-xs text-red-500">{errors.sobrenome}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vendedor@exemplo.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone (Opcional)
            </Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              value={formData.telefone || ""}
              onChange={(e) =>
                handleChange("telefone", applyPhoneMask(e.target.value))
              }
              maxLength={15}
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="senha" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Senha *
            </Label>
            <Input
              id="senha"
              type="password"
              placeholder="Digite uma senha"
              value={formData.senha || ""}
              onChange={(e) => handleChange("senha", e.target.value)}
              minLength={6}
            />
          </div>

          {/* Comissão */}
          <div className="space-y-2">
            <Label htmlFor="comissao" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Comissão (%) *
            </Label>
            <Input
              id="comissao"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              value={formData.comissao}
              onChange={(e) =>
                handleChange("comissao", parseFloat(e.target.value) || 0)
              }
              className={errors.comissao ? "border-red-500" : ""}
            />
            {errors.comissao && (
              <p className="text-xs text-red-500">{errors.comissao}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Porcentagem de comissão sobre o valor total do pedido
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Comissão */}
      {formData.comissao > 0 && (
        <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground">Valor do Pedido:</span>
                <span className="font-semibold text-gray-700">
                  {valorTotalPedido.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Comissão ({formData.comissao}%):
                </span>
                <span className="font-semibold text-green-700">
                  {valorComissao.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div className="pt-3 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-green-900">
                    Comissão do Vendedor:
                  </span>
                  <span className="text-2xl font-bold text-green-700">
                    {valorComissao.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
