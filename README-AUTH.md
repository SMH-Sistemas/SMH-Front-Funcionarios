# Sistema de Autenticação - SMH Sistemas

## 🎨 Design e Identidade Visual

As páginas de login e registro seguem a identidade visual da aplicação SMH Sistemas:

### Paleta de Cores

- **Primary**: Navy Blue (#1e3a5f) - Cor principal da marca
- **Secondary**: Red (#e53e3e) - Cor de destaque
- **Background**: Gradientes suaves com transparência
- **Cards**: Fundo semi-transparente com backdrop-blur

### Elementos Visuais

- **Logo**: Ícone de Package com gradiente
- **Background**: Padrão de pontos sutis
- **Cards**: Bordas arredondadas com sombras elegantes
- **Botões**: Gradientes e estados hover suaves

## 🔐 Funcionalidades Implementadas

### Página de Login (`/login`)

- ✅ Formulário de login com validação
- ✅ Toggle de visibilidade da senha
- ✅ Checkbox "Lembrar de mim"
- ✅ Link "Esqueceu a senha?"
- ✅ Link para página de registro
- ✅ Estados de loading
- ✅ Tratamento de erros

### Página de Registro (`/register`)

- ✅ Formulário completo de registro
- ✅ Validação em tempo real
- ✅ Confirmação de senha
- ✅ Checkbox de termos de uso
- ✅ Estados de loading
- ✅ Tratamento de erros
- ✅ Link para página de login

### Proteção de Rotas

- ✅ Componente `ProtectedRoute`
- ✅ Redirecionamento automático
- ✅ Verificação de autenticação
- ✅ Estados de loading

## 🛠️ Hooks de Autenticação

### `useLogin()`

```typescript
const loginMutation = useLogin();
loginMutation.mutate({ email, password });
```

### `useRegister()`

```typescript
const registerMutation = useRegister();
registerMutation.mutate({ name, email, password });
```

### `useLogout()`

```typescript
const logoutMutation = useLogout();
logoutMutation.mutate();
```

### `useCurrentUser()`

```typescript
const { data: user, isLoading } = useCurrentUser();
```

### `useIsAuthenticated()`

```typescript
const { isAuthenticated, user, isLoading } = useIsAuthenticated();
```

## 🔄 Fluxo de Autenticação

1. **Usuário não autenticado** → Redirecionado para `/login`
2. **Login bem-sucedido** → JWT definido em cookie HttpOnly pelo servidor
3. **Usuário autenticado** → Acesso ao dashboard
4. **Logout** → Token removido, redirecionado para login

## 📡 Endpoints da API

### Autenticação

```
POST /api/auth/login      - Login (define cookie HttpOnly com JWT)
POST /api/auth/register   - Registro (define cookie HttpOnly com JWT)
POST /api/auth/logout     - Logout (invalida cookie)
GET  /api/auth/me         - Usuário atual (requer cookie)
POST /api/auth/refresh    - Renovar token (atualiza cookie)
```

### Estrutura de Resposta

```json
{
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "admin" | "user",
      "createdAt": "string",
      "updatedAt": "string"
    }
  },
  "success": true
}
```

### Requisitos de Cookies (back-end)

- Definir o JWT em cookie com os atributos:
  - HttpOnly: true (inacessível ao JavaScript)
  - Secure: true (obrigatório em HTTPS)
  - SameSite: "lax" (ou "strict" conforme necessidade)
  - Path: "/"
  - Domain: conforme seu domínio (ex.: ".seudominio.com")
- Em desenvolvimento local, se usar HTTP, defina Secure=false temporariamente
- Habilitar CORS para credenciais:
  - Access-Control-Allow-Credentials: true
  - Access-Control-Allow-Origin: origem exata (não usar "\*")
  - Access-Control-Allow-Headers: Content-Type, Authorization
  - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS

> Importante: o front-end está configurado com `credentials: include`, então os cookies serão enviados automaticamente.

## 🎯 Recursos de UX/UI

### Estados Visuais

- **Loading**: Spinners animados
- **Erro**: Mensagens claras e destacadas
- **Sucesso**: Notificações toast
- **Validação**: Feedback em tempo real

### Responsividade

- Design mobile-first
- Layout adaptativo
- Componentes flexíveis

### Acessibilidade

- Labels apropriados
- Navegação por teclado
- Contraste adequado
- Foco visível

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Implementar Back-end

- Criar endpoints de autenticação
- Implementar JWT ou sessões
- Configurar CORS

### 3. Testar Fluxo

1. Acesse `/login` ou `/register`
2. Preencha o formulário
3. Verifique redirecionamento
4. Teste logout

## 🔧 Personalização

### Cores

Edite as variáveis CSS em `src/index.css`:

```css
:root {
  --primary: 210 45% 17%; /* Navy Blue */
  --secondary: 356 85% 51%; /* Red */
  --accent: 356 85% 51%; /* Red */
}
```

### Layout

- Modifique os gradientes de fundo
- Ajuste o espaçamento dos cards
- Personalize as animações

### Validação

- Adicione regras de validação customizadas
- Implemente validação de força da senha
- Configure limites de tentativas

## 📱 Compatibilidade

- ✅ Chrome/Edge (últimas versões)
- ✅ Firefox (últimas versões)
- ✅ Safari (últimas versões)
- ✅ Mobile browsers
- ✅ PWA ready

## 🔒 Segurança

- ✅ Tokens JWT
- ✅ Validação client-side
- ✅ Sanitização de inputs
- ✅ Proteção CSRF
- ✅ Headers de segurança
