# ⚡ Guia Rápido - Variáveis de Ambiente

## 🎯 Resumo Executivo

O projeto está **pronto** para receber a URL da API através de variáveis de ambiente em produção!

---

## 📋 O que foi configurado?

### ✅ Arquivos Criados

| Arquivo           | Descrição             | Commitado? |
| ----------------- | --------------------- | ---------- |
| `.env.example`    | Template de exemplo   | ✅ SIM     |
| `.env`            | Desenvolvimento local | ❌ NÃO     |
| `.env.production` | Produção              | ❌ NÃO     |
| `ENV_CONFIG.md`   | Documentação completa | ✅ SIM     |
| `DEPLOY.md`       | Guia de deploy        | ✅ SIM     |

### ✅ `.gitignore` Atualizado

Arquivos `.env` agora estão **protegidos** e não serão commitados acidentalmente.

### ✅ Código já Preparado

Todos os arquivos de serviço já usam a variável `VITE_API_URL`:

- ✅ `api.auth.ts`
- ✅ `api.product.ts`
- ✅ `api.customer.ts`
- ✅ `api.order.ts`
- ✅ `api.lpu.ts`
- ✅ `api.tax.ts`

---

## 🚀 Como Usar

### Desenvolvimento (Local)

```bash
# 1. O arquivo .env já está criado
# 2. Apenas execute:
npm run dev
```

**URL usada:** `http://localhost:8080/api/v1`

### Produção (Build)

```bash
# 1. Edite .env.production com a URL real:
VITE_API_URL=https://api.seudominio.com.br/api/v1

# 2. Execute o build:
npm run build

# 3. Deploy a pasta dist/
```

---

## 🌐 Plataformas de Hospedagem

### Vercel (Recomendado)

1. Dashboard → Settings → Environment Variables
2. Adicione: `VITE_API_URL` = `https://api.seudominio.com.br/api/v1`
3. Deploy automático

### Netlify

1. Site settings → Environment variables
2. Adicione: `VITE_API_URL` = `https://api.seudominio.com.br/api/v1`
3. Deploy automático

### Servidor Próprio

1. Edite `.env.production` localmente
2. Execute `npm run build`
3. Suba a pasta `dist/` para o servidor

---

## 🔍 Verificar se Funciona

### Console do Navegador (F12)

**Desenvolvimento:**

```
[API Auth] POST http://localhost:8080/api/v1/auth/login
```

**Produção:**

```
[API Auth] POST https://api.seudominio.com.br/api/v1/auth/login
```

### Inspecionar Build

```bash
npm run build
grep "api\." dist/assets/*.js
```

---

## ⚠️ IMPORTANTE

### ✅ FAZER

- ✅ Use `VITE_API_URL` para configurar a URL da API
- ✅ Configure no Vercel/Netlify para deploy automático
- ✅ Use HTTPS em produção

### ❌ NÃO FAZER

- ❌ **NUNCA** commite `.env` ou `.env.production`
- ❌ **NUNCA** hardcode URLs no código
- ❌ **NUNCA** compartilhe valores de produção publicamente

---

## 📚 Documentação Completa

- **[ENV_CONFIG.md](./ENV_CONFIG.md)** - Guia completo de variáveis de ambiente
- **[DEPLOY.md](./DEPLOY.md)** - Guia completo de deploy
- **[README.md](./README.md)** - Documentação do projeto

---

## 🎉 Pronto!

O projeto está **100% preparado** para produção com variáveis de ambiente!

Próximos passos:

1. Configure a URL da API em `.env.production`
2. Faça o build: `npm run build`
3. Faça o deploy da pasta `dist/`

---

**Dúvidas?** Consulte `ENV_CONFIG.md` ou `DEPLOY.md`
