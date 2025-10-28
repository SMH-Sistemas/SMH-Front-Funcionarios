# 🚀 Guia de Deploy para Produção

Este guia explica como configurar e fazer deploy da aplicação SMH Funcionários em ambiente de produção.

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn configurado
- Servidor web (Nginx, Apache, etc.) ou plataforma de hospedagem (Vercel, Netlify, etc.)
- URL da API backend em produção

---

## 🔧 Configuração de Variáveis de Ambiente

### 1. Ambiente de Desenvolvimento

O arquivo `.env` já está configurado para desenvolvimento:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### 2. Ambiente de Produção

Edite o arquivo `.env.production` e configure a URL da sua API em produção:

```env
VITE_API_URL=https://api.seudominio.com.br/api/v1
```

**⚠️ IMPORTANTE:**

- Substitua `https://api.seudominio.com.br/api/v1` pela URL real da sua API
- Certifique-se de que a URL termina com `/api/v1` (ou o path correto da sua API)
- Use HTTPS em produção para segurança

---

## 🏗️ Build para Produção

### Passo 1: Instalar Dependências

```bash
npm install
```

ou

```bash
yarn install
```

### Passo 2: Executar Build

O Vite automaticamente usará o arquivo `.env.production` ao fazer build:

```bash
npm run build
```

ou

```bash
yarn build
```

Isso irá:

- Ler as variáveis do arquivo `.env.production`
- Compilar o código React/TypeScript
- Otimizar assets (CSS, JS, imagens)
- Gerar arquivos estáticos na pasta `dist/`

### Passo 3: Testar Build Localmente (Opcional)

Antes de fazer deploy, você pode testar o build localmente:

```bash
npm run preview
```

ou

```bash
yarn preview
```

---

## 📤 Deploy

### Opção 1: Vercel (Recomendado)

1. Instale o Vercel CLI:

```bash
npm install -g vercel
```

2. Faça login:

```bash
vercel login
```

3. Configure as variáveis de ambiente no Vercel:

   - Acesse o dashboard do Vercel
   - Vá em Settings → Environment Variables
   - Adicione: `VITE_API_URL` com o valor da sua API em produção

4. Faça o deploy:

```bash
vercel --prod
```

### Opção 2: Netlify

1. Instale o Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Faça login:

```bash
netlify login
```

3. Configure as variáveis de ambiente:

   - Acesse o dashboard do Netlify
   - Vá em Site settings → Environment variables
   - Adicione: `VITE_API_URL` com o valor da sua API em produção

4. Faça o deploy:

```bash
netlify deploy --prod
```

### Opção 3: Servidor Próprio (Nginx/Apache)

1. Faça o build conforme instruções acima

2. Copie a pasta `dist/` para o servidor:

```bash
scp -r dist/* usuario@servidor:/var/www/html/
```

3. Configure o Nginx para servir a aplicação:

```nginx
server {
    listen 80;
    server_name seudominio.com.br;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configuração de cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. Reinicie o Nginx:

```bash
sudo systemctl reload nginx
```

### Opção 4: Docker

1. Crie um arquivo `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

2. Crie um arquivo `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. Build da imagem:

```bash
docker build -t smh-funcionarios .
```

4. Execute o container:

```bash
docker run -d -p 80:80 --name smh-app smh-funcionarios
```

---

## 🔒 Segurança

### Variáveis de Ambiente

- ✅ **Nunca** commite o arquivo `.env` ou `.env.production` com valores reais
- ✅ Use `.env.example` como template (sem valores sensíveis)
- ✅ Configure variáveis de ambiente diretamente na plataforma de hospedagem
- ✅ Use HTTPS em produção

### CORS

Certifique-se de que o backend aceita requisições do domínio do frontend:

```java
// Backend - SecurityConfiguration.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",           // Desenvolvimento
        "https://seudominio.com.br"        // Produção
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));
    configuration.setAllowCredentials(true);
    // ... outras configurações
}
```

---

## 📊 Monitoramento

### Verificar se a API está configurada corretamente

1. Abra o console do navegador (F12)
2. Verifique os logs das requisições:
   - Devem apontar para a URL de produção
   - Exemplo: `[API Auth] POST https://api.seudominio.com.br/api/v1/auth/login`

### Variáveis de Ambiente no Build

Para verificar se as variáveis estão sendo aplicadas corretamente, inspecione o código JavaScript compilado:

```bash
# No arquivo dist/assets/*.js, procure por:
grep -r "api.seudominio.com.br" dist/
```

---

## 🐛 Troubleshooting

### Problema: API retorna erro 404

**Solução:**

- Verifique se a `VITE_API_URL` está correta
- Confirme que o backend está rodando e acessível
- Teste a URL da API diretamente no navegador

### Problema: CORS error

**Solução:**

- Configure CORS no backend para aceitar o domínio do frontend
- Verifique se `withCredentials: true` está configurado (já está nos serviços)

### Problema: Página em branco após deploy

**Solução:**

- Verifique se o servidor está configurado para redirecionar todas as rotas para `index.html`
- Veja os logs do console do navegador (F12) para erros

### Problema: Assets não carregam (404)

**Solução:**

- Verifique se o `base` está correto no `vite.config.js`
- Para deploy em subpasta, adicione: `base: '/subpasta/'`

---

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas em `.env.production`
- [ ] Build executado sem erros (`npm run build`)
- [ ] Build testado localmente (`npm run preview`)
- [ ] Backend configurado com CORS correto
- [ ] HTTPS configurado no servidor
- [ ] Cookies HttpOnly funcionando (mesma origem ou configuração correta)
- [ ] Testes de login e autenticação
- [ ] Testes de todas as funcionalidades principais
- [ ] Monitoramento e logs configurados

---

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do servidor backend
3. Teste a API usando Postman/Insomnia
4. Revise as configurações de CORS
5. Confirme que todas as variáveis de ambiente estão corretas

---

## 🔄 Atualizações

Para atualizar a aplicação em produção:

1. Faça as alterações no código
2. Commit e push para o repositório
3. Execute novamente o build: `npm run build`
4. Faça deploy dos novos arquivos da pasta `dist/`

Se usar CI/CD (Vercel/Netlify):

- O deploy será automático após push para a branch `main`/`master`

---

**Desenvolvido com ❤️ pela equipe SMH Sistemas**
