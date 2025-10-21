export type SaidaStatus = 
  | "rascunho" 
  | "reservado" 
  | "em_transporte" 
  | "entregue" 
  | "cancelado" 
  | "estornado";

export type Cliente = {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
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
