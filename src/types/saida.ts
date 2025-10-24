export type SaidaStatus =
  | "rascunho"
  | "reservado"
  | "em_transporte"
  | "entregue"
  | "cancelado"
  | "estornado";

export type Cliente = {
  id?: string;
  nome: string;
  sobrenome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  senha?: string; // Senha para criação do cliente
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes?: string;
};

export type ItemSaida = {
  id: string;
  produtoId: string;
  sku: string;
  nome: string;
  unidade: string;
  precoUnitario: number;
  quantidade: number;
  quantidadeDisponivel: number;
  subtotal: number;
  productType?: "PRODUCT" | "SERVICE"; // Tipo do produto/serviço
  taxId?: number; // ID do imposto aplicado
  taxPercentage?: number; // Porcentagem do imposto
  taxValue?: number; // Valor do imposto calculado
};

export type VendedorPedido = {
  id?: string;
  nome: string;
  sobrenome: string;
  email: string;
  senha?: string; // Senha para criação do vendedor
  telefone?: string;
  comissao: number; // Porcentagem de comissão sobre o pedido
};

export type Saida = {
  id: string;
  numero: string;
  data: string;
  cliente: Cliente;
  itens: ItemSaida[];
  valorTotal: number;
  status: SaidaStatus;
  responsavel: string;
  tipoSaida: "venda" | "transferencia" | "doacao" | "devolucao";
  dadosEnvio: {
    enderecoEntrega: Cliente["endereco"];
    transportadora?: string;
    numeroRastreio?: string;
    dataPrevista?: string;
    observacoes?: string;
  };
  timeline: {
    status: SaidaStatus;
    data: string;
    responsavel: string;
    observacao?: string;
  }[];
  logs: {
    id: string;
    data: string;
    usuario: string;
    acao: string;
    detalhes: string;
  }[];
};
