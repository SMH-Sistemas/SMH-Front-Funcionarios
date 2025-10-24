// Função para aplicar máscara de CPF (###.###.###-##) ou CNPJ (##.###.###/####-##)
export const applyCpfCnpjMask = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // CPF: 11 dígitos
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  // CNPJ: 14 dígitos
  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

// Função para aplicar máscara de telefone (##) #####-#### ou (##) ####-####
export const applyPhoneMask = (value: string): string => {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 10) {
    // Telefone fixo: (##) ####-####
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }

  // Celular: (##) #####-####
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

// Função para aplicar máscara de CEP (#####-###)
export const applyCepMask = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  return numbers.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
};

// Função para remover máscara (deixar apenas números)
export const removeMask = (value: string): string => {
  return value.replace(/\D/g, "");
};

// Interface para resposta da API ViaCEP
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Função para buscar endereço pelo CEP usando a API ViaCEP
export const fetchAddressByCep = async (
  cep: string
): Promise<ViaCepResponse | null> => {
  const cleanCep = removeMask(cep);

  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (!response.ok) {
      throw new Error("Erro ao buscar CEP");
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
};
