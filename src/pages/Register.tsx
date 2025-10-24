import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Package,
  Loader2,
  Check,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/useAuth";
import { toast } from "sonner";

// Função para formatar telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
      6
    )}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7,
      11
    )}`;
  }
};

// Função para formatar CPF: XXX.XXX.XXX-XX
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  } else if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  } else {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
      6,
      9
    )}-${numbers.slice(9, 11)}`;
  }
};

// Função para formatar CNPJ: XX.XXX.XXX/XXXX-XX
const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8)}`;
  } else {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(
      5,
      8
    )}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }
};

// Função para formatar CPF ou CNPJ automaticamente
const formatFiscalIdentification = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  // Se tem mais de 11 dígitos, formata como CNPJ
  if (numbers.length > 11) {
    return formatCNPJ(value);
  } else {
    return formatCPF(value);
  }
};

const Register = () => {
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    let formattedValue = value;

    // Aplicar máscaras de formatação
    if (name === "phoneNumber") {
      formattedValue = formatPhoneNumber(value);
    } else if (name === "fiscalIdentification") {
      formattedValue = formatFiscalIdentification(value);
    }

    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : formattedValue,
    };

    setFormData(newFormData);

    // Limpar erro quando usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Validação em tempo real para confirmação de senha
    if (name === "confirmPassword" || name === "password") {
      const password =
        name === "password" ? formattedValue : newFormData.password;
      const confirmPassword =
        name === "confirmPassword"
          ? formattedValue
          : newFormData.confirmPassword;

      if (confirmPassword && password !== confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "As senhas não coincidem",
        }));
      } else if (confirmPassword && password === confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Sobrenome é obrigatório";
    } else if (formData.surname.trim().length < 2) {
      newErrors.surname = "Sobrenome deve ter pelo menos 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Telefone é obrigatório";
    } else {
      const numbers = formData.phoneNumber.replace(/\D/g, "");
      if (numbers.length < 10 || numbers.length > 11) {
        newErrors.phoneNumber = "Telefone deve ter 10 ou 11 dígitos";
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Você deve aceitar os termos de uso";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Mostrar mensagem de erro visual
      const errorMessages = Object.values(errors).filter(Boolean);
      if (errorMessages.length > 0) {
        toast.error("Por favor, corrija os erros no formulário", {
          description: errorMessages[0],
          duration: 4000,
        });

        // Scroll para o primeiro erro
        const firstErrorField = Object.keys(errors).find((key) => errors[key]);
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
          element?.focus();
        }
      }
      return;
    }

    // Remover formatação antes de enviar para o backend
    registerMutation.mutate({
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber.replace(/\D/g, ""),
    });
  };

  // Verificar se há erros ou campos obrigatórios vazios
  const hasErrors = Object.values(errors).some((error) => error !== "");
  const isFormIncomplete =
    !formData.name.trim() ||
    !formData.surname.trim() ||
    !formData.email.trim() ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.phoneNumber.trim() ||
    !formData.acceptTerms;

  const isSubmitDisabled =
    hasErrors || isFormIncomplete || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f1f5f9%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 shadow-lg">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">SMH Sistemas</h1>
          <p className="text-muted-foreground">Crie sua conta para começar</p>
        </div>

        {/* Card de Registro */}
        <Card className="p-8 shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={50}
                className={`h-11 ${errors.name ? "border-destructive" : ""}`}
                disabled={registerMutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname" className="text-sm font-medium">
                Sobrenome
              </Label>
              <Input
                id="surname"
                name="surname"
                type="text"
                placeholder="Seu sobrenome"
                value={formData.surname}
                onChange={handleInputChange}
                maxLength={50}
                className={`h-11 ${errors.surname ? "border-destructive" : ""}`}
                disabled={registerMutation.isPending}
              />
              {errors.surname && (
                <p className="text-sm text-destructive">{errors.surname}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Telefone
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength={15}
                className={`h-11 ${
                  errors.phoneNumber ? "border-destructive" : ""
                }`}
                disabled={registerMutation.isPending}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                maxLength={100}
                className={`h-11 ${errors.email ? "border-destructive" : ""}`}
                disabled={registerMutation.isPending}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`h-11 pr-10 ${
                    errors.password ? "border-destructive" : ""
                  }`}
                  disabled={registerMutation.isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={registerMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`h-11 pr-20 ${
                    errors.confirmPassword
                      ? "border-destructive"
                      : formData.confirmPassword &&
                        formData.password &&
                        formData.password === formData.confirmPassword
                      ? "border-green-500 focus-visible:ring-green-500"
                      : ""
                  }`}
                  disabled={registerMutation.isPending}
                />
                <div className="absolute right-0 top-0 h-11 flex items-center gap-1 pr-1">
                  {formData.confirmPassword && formData.password && (
                    <>
                      {formData.password === formData.confirmPassword ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-10 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={registerMutation.isPending}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.confirmPassword}
                </p>
              )}
              {!errors.confirmPassword &&
                formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    As senhas coincidem
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-input"
                  disabled={registerMutation.isPending}
                />
                <span className="text-sm text-muted-foreground">
                  Eu aceito os{" "}
                  <Link
                    to="/terms"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link
                    to="/privacy"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    política de privacidade
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#1B2B3A] hover:bg-[#16222D] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitDisabled}
              title={
                isSubmitDisabled && !registerMutation.isPending
                  ? "Preencha todos os campos corretamente para continuar"
                  : ""
              }
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta
                </>
              )}
            </Button>

            {isSubmitDisabled &&
              !registerMutation.isPending &&
              (hasErrors || isFormIncomplete) && (
                <div className="text-center">
                  <p className="text-sm text-amber-600 flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {hasErrors
                      ? "Corrija os erros antes de continuar"
                      : "Preencha todos os campos obrigatórios"}
                  </p>
                </div>
              )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Já tem uma conta?{" "}
              <span className="text-primary hover:text-primary/80 font-medium">
                <Link to="/login">Fazer login</Link>
              </span>
            </p>
          </div>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2025 SMH Sistemas. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
