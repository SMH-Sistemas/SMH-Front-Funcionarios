# Configuração da API

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# URL da API do back-end
VITE_API_URL=http://localhost:3000/api

# Configurações opcionais
VITE_APP_NAME=SMH Sistemas
VITE_APP_VERSION=1.0.0
```

## Endpoints Esperados

O front-end espera que o back-end tenha os seguintes endpoints:

### Produtos

- `GET /api/products` - Listar todos os produtos
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar novo produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `POST /api/products/discount` - Aplicar desconto em múltiplos produtos

### Dashboard

- `GET /api/dashboard/stats` - Estatísticas do dashboard

## Estrutura de Resposta

Todas as respostas devem seguir este padrão:

```json
{
  "data": {}, // Dados da resposta
  "message": "Mensagem opcional",
  "success": true
}
```

### Exemplo - Lista de Produtos

```json
{
  "data": [
    {
      "id": "1",
      "name": "Sistema de Automação Industrial",
      "sku": "SMH-AUTO-001",
      "category": "Automação",
      "price": 15000,
      "stock": 12,
      "discount": 0,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "success": true
}
```

### Exemplo - Estatísticas do Dashboard

```json
{
  "data": {
    "totalProducts": 150,
    "totalValue": 2500000,
    "lowStockProducts": 5
  },
  "success": true
}
```

### Exemplo - Aplicar Desconto

```json
{
  "data": [
    // Array de produtos atualizados
  ],
  "message": "Desconto aplicado com sucesso",
  "success": true
}
```

## Tratamento de Erros

O front-end trata automaticamente:

- Estados de loading
- Erros de conexão
- Retry automático para erros 5xx
- Cache inteligente com React Query
- Notificações de sucesso/erro

## Configuração do Back-end

Para testar localmente, certifique-se de que:

1. O back-end está rodando na porta 3000
2. CORS está configurado para aceitar requisições do front-end
3. Os endpoints estão implementados conforme especificado
4. As respostas seguem o formato JSON esperado
