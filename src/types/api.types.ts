// src/types/api.types.ts

/**
 * Formato padrão de erro retornado pelo backend
 *
 * Corresponde ao ErrorResponse do backend:
 * package com.aula.emailsmh.interfaces.controller.exception;
 *
 * public record ErrorResponse(
 *   Instant timestamp,
 *   int status,
 *   String error,
 *   String message,
 *   String path
 * )
 */
export interface ErrorResponse {
  /** Data e hora em que o erro ocorreu (formato ISO 8601) */
  timestamp: string;

  /** Código de status HTTP (400, 404, 500, etc.) */
  status: number;

  /** Tipo do erro (ex: "Bad Request", "Not Found", "Internal Server Error") */
  error: string;

  /** Mensagem descritiva do erro para o usuário */
  message: string;

  /** Endpoint da API que gerou o erro */
  path: string;
}

/**
 * Interface genérica de resposta da API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Dicionário de traduções de mensagens de erro comuns (EN → PT-BR)
 */
const errorTranslations: Record<string, string> = {
  // Erros HTTP comuns
  "Bad Request": "Requisição Inválida",
  Unauthorized: "Não Autorizado",
  Forbidden: "Acesso Negado",
  "Not Found": "Não Encontrado",
  "Method Not Allowed": "Método Não Permitido",
  Conflict: "Conflito",
  "Internal Server Error": "Erro Interno do Servidor",
  "Service Unavailable": "Serviço Indisponível",
  "Gateway Timeout": "Tempo de Conexão Esgotado",

  // Mensagens de validação
  "Validation failed": "Falha na validação",
  "Invalid input": "Entrada inválida",
  "Required field": "Campo obrigatório",
  "Field is required": "Campo obrigatório",
  "Invalid format": "Formato inválido",
  "Invalid email": "E-mail inválido",
  "Invalid password": "Senha inválida",
  "Password too weak": "Senha muito fraca",
  "Passwords do not match": "As senhas não coincidem",

  // Mensagens de autenticação
  "Invalid credentials": "Credenciais inválidas",
  "User not found": "Usuário não encontrado",
  "Email already exists": "E-mail já cadastrado",
  "Email already registered": "E-mail já cadastrado",
  "Token expired": "Token expirado",
  "Invalid token": "Token inválido",
  "Session expired": "Sessão expirada",
  "Please login again": "Por favor, faça login novamente",

  // Mensagens de recursos
  "Resource not found": "Recurso não encontrado",
  "Product not found": "Produto não encontrado",
  "LPU not found": "LPU não encontrada",
  "Order not found": "Pedido não encontrado",
  "Already exists": "Já existe",
  "Duplicate entry": "Entrada duplicada",

  // Mensagens de operação
  "Operation failed": "Operação falhou",
  "Cannot delete": "Não é possível excluir",
  "Cannot update": "Não é possível atualizar",
  "Cannot create": "Não é possível criar",
  "Insufficient permissions": "Permissões insuficientes",
  "No permission": "Sem permissão",

  // Mensagens de rede
  "Network error": "Erro de rede",
  "Connection failed": "Falha na conexão",
  Timeout: "Tempo esgotado",
  "Server error": "Erro no servidor",
};

/**
 * Palavras-chave para tradução parcial de mensagens
 */
const keywordTranslations: Record<string, string> = {
  "not found": "não encontrado",
  "already exists": "já existe",
  "is required": "é obrigatório",
  "must be": "deve ser",
  "must not": "não deve",
  "cannot be": "não pode ser",
  invalid: "inválido",
  expired: "expirado",
  failed: "falhou",
  error: "erro",
  denied: "negado",
  forbidden: "proibido",
  unauthorized: "não autorizado",
  conflict: "conflito",
  duplicate: "duplicado",
  missing: "ausente",
  required: "obrigatório",
  empty: "vazio",
  "too short": "muito curto",
  "too long": "muito longo",
  minimum: "mínimo",
  maximum: "máximo",
  email: "e-mail",
  password: "senha",
  user: "usuário",
  product: "produto",
  order: "pedido",
  customer: "cliente",
};

/**
 * Helper para extrair e traduzir mensagem de erro do formato ErrorResponse
 */
export function extractErrorMessage(errorData: unknown): string {
  if (!errorData || typeof errorData !== "object") {
    return "Erro desconhecido";
  }

  const error = errorData as Partial<ErrorResponse>;

  // Priorizar o campo message que contém a descrição do erro
  let message =
    error.message || // Mensagem descritiva
    error.error || // Tipo do erro
    "Erro ao processar requisição";

  // Traduzir mensagem
  return translateErrorMessage(message);
}

/**
 * Traduz uma mensagem de erro do inglês para português
 */
function translateErrorMessage(message: string): string {
  if (!message) return "Erro desconhecido";

  // 1. Verificar tradução exata no dicionário
  const exactTranslation = errorTranslations[message];
  if (exactTranslation) {
    return exactTranslation;
  }

  // 2. Verificar tradução case-insensitive
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(errorTranslations)) {
    if (key.toLowerCase() === lowerMessage) {
      return value;
    }
  }

  // 3. Traduzir por palavras-chave (tradução parcial)
  let translatedMessage = message;
  for (const [englishKeyword, portugueseKeyword] of Object.entries(
    keywordTranslations
  )) {
    const regex = new RegExp(englishKeyword, "gi");
    translatedMessage = translatedMessage.replace(regex, portugueseKeyword);
  }

  // 4. Se a mensagem foi alterada, retornar a tradução parcial
  if (translatedMessage !== message) {
    // Capitalizar primeira letra
    return (
      translatedMessage.charAt(0).toUpperCase() + translatedMessage.slice(1)
    );
  }

  // 5. Se não houver tradução, retornar mensagem original
  return message;
}
