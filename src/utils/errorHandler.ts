/**
 * Extrai uma mensagem de erro amigável de diferentes tipos de erro
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "Ocorreu um erro desconhecido";
  }

  // Se é um Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Se é um objeto com mensagem
  if (typeof error === "object") {
    const errorObj = error as any;

    // Tentar diferentes propriedades comuns
    if (errorObj.message) return errorObj.message;
    if (errorObj.error) return errorObj.error;
    if (errorObj.detail) return errorObj.detail;
    if (errorObj.title) return errorObj.title;

    // Se tem status HTTP
    if (errorObj.status) {
      return `Erro ${errorObj.status}: ${getStatusMessage(errorObj.status)}`;
    }
  }

  // Se é uma string
  if (typeof error === "string") {
    return error;
  }

  // Fallback
  return "Ocorreu um erro inesperado. Tente novamente.";
}

/**
 * Retorna mensagem amigável para códigos de status HTTP
 */
function getStatusMessage(status: number): string {
  const messages: Record<number, string> = {
    400: "Requisição inválida",
    401: "Não autorizado. Faça login novamente.",
    403: "Acesso negado",
    404: "Recurso não encontrado",
    409: "Conflito. O recurso já existe.",
    422: "Dados inválidos",
    429: "Muitas requisições. Aguarde um momento.",
    500: "Erro interno do servidor",
    502: "Servidor indisponível",
    503: "Serviço temporariamente indisponível",
    504: "Tempo de conexão esgotado",
  };

  return messages[status] || "Erro no servidor";
}

/**
 * Formata erros de validação específicos
 */
export function formatValidationError(error: unknown): string {
  const message = getErrorMessage(error);

  // Mapear mensagens comuns de validação para português
  const validationMap: Record<string, string> = {
    required: "Este campo é obrigatório",
    invalid: "Valor inválido",
    "already exists": "Já existe um registro com estes dados",
    "not found": "Não encontrado",
    unauthorized: "Não autorizado",
    forbidden: "Acesso negado",
  };

  // Verificar se a mensagem contém alguma palavra-chave
  for (const [key, translation] of Object.entries(validationMap)) {
    if (message.toLowerCase().includes(key)) {
      return translation;
    }
  }

  return message;
}
