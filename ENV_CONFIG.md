# ⚙️ Configuração de Variáveis de Ambiente

Este documento explica como configurar e usar variáveis de ambiente no projeto SMH Funcionários.

---

## 📁 Estrutura de Arquivos

### `.env.example` (Template)

Arquivo de exemplo que **deve** ser commitado no Git. Contém a estrutura das variáveis sem valores sensíveis.

### `.env` (Desenvolvimento)

Arquivo para ambiente de **desenvolvimento local**.

- ❌ **NÃO deve** ser commitado no Git
- ✅ Já está no `.gitignore`
- ✅ Cada desenvolvedor cria o seu próprio

### `.env.production` (Produção)

Arquivo para ambiente de **produção**.

- ❌ **NÃO deve** ser commitado no Git com valores reais
- ✅ Já está no `.gitignore`
- ✅ Configurado no servidor ou plataforma de hospedagem

---

## 🔧 Variáveis Disponíveis

### `VITE_API_URL`

**Descrição:** URL base da API do backend

**Valores:**

- **Desenvolvimento:** `http://localhost:8080/api/v1`
- **Produção:** `https://api.seudominio.com.br/api/v1`

**Onde é usado:**

- `src/services/api.auth.ts`
- `src/services/api.product.ts`
- `src/services/api.customer.ts`
- `src/services/api.order.ts`
- `src/services/api.lpu.ts`
- `src/services/api.tax.ts`

**Exemplo de uso no código:**

```typescript
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/api/v1";
```

---

## 🚀 Como Usar

### 1️⃣ Primeiro Uso (Desenvolvedor)

Ao clonar o repositório pela primeira vez:

```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env

# 2. Edite o arquivo .env com suas configurações locais
# (geralmente não precisa alterar nada para desenvolvimento)
```

### 2️⃣ Executar em Desenvolvimento

```bash
# O Vite carrega automaticamente o arquivo .env
npm run dev
```

O Vite irá:

1. Ler o arquivo `.env`
2. Disponibilizar as variáveis através de `import.meta.env`
3. Substituir as referências no código durante o build

### 3️⃣ Build para Produção

```bash
# O Vite carrega automaticamente o arquivo .env.production
npm run build
```

O Vite irá:

1. Ler o arquivo `.env.production`
2. Compilar o código com os valores de produção
3. Gerar os arquivos estáticos na pasta `dist/`

---

## 🌐 Configuração por Plataforma

### Vercel

1. Acesse o dashboard do projeto
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api.seudominio.com.br/api/v1`
   - **Environment:** Production

### Netlify

1. Acesse o dashboard do site
2. Vá em **Site settings** → **Environment variables**
3. Clique em **Add a variable**
4. Adicione:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api.seudominio.com.br/api/v1`

### Docker

Use variáveis de ambiente no `docker-compose.yml`:

```yaml
version: "3.8"
services:
  frontend:
    build:
      context: .
      args:
        VITE_API_URL: https://api.seudominio.com.br/api/v1
    ports:
      - "80:80"
```

Ou passe via linha de comando:

```bash
docker build --build-arg VITE_API_URL=https://api.seudominio.com.br/api/v1 -t smh-app .
```

### GitHub Actions

No arquivo `.github/workflows/deploy.yml`:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      VITE_API_URL: ${{ secrets.VITE_API_URL }}
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
```

E adicione a secret no GitHub:

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Name: `VITE_API_URL`
4. Value: `https://api.seudominio.com.br/api/v1`

---

## 🔍 Como Verificar se Está Funcionando

### Durante o Desenvolvimento

Abra o console do navegador (F12) e procure por logs como:

```
[API Auth] POST http://localhost:8080/api/v1/auth/login
[API Product] GET http://localhost:8080/api/v1/products
```

### Em Produção

Após o deploy, abra o console e verifique:

```
[API Auth] POST https://api.seudominio.com.br/api/v1/auth/login
[API Product] GET https://api.seudominio.com.br/api/v1/products
```

### Inspecionar o Build

Para ver qual URL foi compilada:

```bash
# Após executar npm run build
grep -r "VITE_API_URL" dist/assets/*.js
```

---

## ⚠️ Regras Importantes

### ✅ FAZER

- ✅ Usar `.env` para desenvolvimento local
- ✅ Usar `.env.production` ou variáveis da plataforma para produção
- ✅ Commitar apenas o `.env.example`
- ✅ Adicionar `.env*` no `.gitignore` (já feito)
- ✅ Documentar novas variáveis neste arquivo
- ✅ Prefixar variáveis do Vite com `VITE_`

### ❌ NÃO FAZER

- ❌ **NUNCA** commitar `.env` ou `.env.production` com valores reais
- ❌ **NUNCA** compartilhar valores de produção publicamente
- ❌ **NUNCA** hardcodar URLs no código
- ❌ **NUNCA** usar variáveis sem o prefixo `VITE_`

---

## 🔐 Segurança

### Variáveis Públicas vs Privadas

⚠️ **IMPORTANTE:** As variáveis do Vite (`VITE_*`) são **PÚBLICAS**!

Elas são **embutidas no código JavaScript** que é enviado ao navegador, então:

- ✅ **SIM:** URLs de API, configurações públicas
- ❌ **NÃO:** API Keys secretas, senhas, tokens privados

Para dados sensíveis:

- Use variáveis de ambiente **no backend**
- Nunca exponha credenciais no frontend

### HTTPS em Produção

- ✅ Sempre use HTTPS para a API em produção
- ✅ Configure CORS corretamente no backend
- ✅ Use cookies HttpOnly para autenticação (já implementado)

---

## 🐛 Troubleshooting

### Problema: Variável não é reconhecida

**Sintoma:**

```javascript
console.log(import.meta.env.VITE_API_URL); // undefined
```

**Soluções:**

1. Certifique-se de que a variável começa com `VITE_`
2. Reinicie o servidor de desenvolvimento (`npm run dev`)
3. Verifique se o arquivo `.env` está na raiz do projeto
4. Não use espaços: `VITE_API_URL=valor` (correto)

### Problema: Build usa URL errada

**Soluções:**

1. Verifique se `.env.production` está configurado
2. Delete a pasta `dist/` e rode `npm run build` novamente
3. Limpe o cache: `rm -rf node_modules/.vite`

### Problema: API retorna CORS error

**Soluções:**

1. Configure CORS no backend para aceitar o domínio do frontend
2. Verifique se a URL da API está correta
3. Confirme que está usando HTTPS em produção

---

## 📚 Documentação Adicional

- [Vite - Env Variables and Modes](https://vitejs.dev/guide/env-and-mode.html)
- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy
- [README.md](./README.md) - Documentação principal do projeto

---

## 🔄 Adicionando Novas Variáveis

Se precisar adicionar uma nova variável de ambiente:

1. **Adicione em `.env.example`**

```bash
VITE_NOVA_VARIAVEL=valor_exemplo
```

2. **Adicione em `.env` (seu local)**

```bash
VITE_NOVA_VARIAVEL=valor_desenvolvimento
```

3. **Adicione em `.env.production`**

```bash
VITE_NOVA_VARIAVEL=valor_producao
```

4. **Configure na plataforma de hospedagem** (Vercel/Netlify/etc)

5. **Use no código**

```typescript
const novaVariavel = import.meta.env.VITE_NOVA_VARIAVEL;
```

6. **Documente neste arquivo** (seção "Variáveis Disponíveis")

---

**Última atualização:** Outubro 2025
