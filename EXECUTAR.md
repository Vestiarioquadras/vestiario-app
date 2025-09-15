# 🚀 Como Executar o Vestiário App

## ⚡ Execução Rápida

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar o Projeto
```bash
npm run dev
```

### 3. Acessar no Navegador
Abra: `http://localhost:3000`

## 🔐 Credenciais para Teste

### Jogador
- **Email**: `jogador@vestiario.com`
- **Senha**: `123456`

### Dono
- **Email**: `dono@vestiario.com`
- **Senha**: `123456`

## 📋 Checklist de Funcionalidades

### ✅ Página de Login
- [x] Design responsivo com Material UI
- [x] Validação de campos (email e senha)
- [x] Checkbox de consentimento LGPD
- [x] Feedback visual durante carregamento
- [x] Tratamento de erros
- [x] Logo do Vestiário

### ✅ Autenticação
- [x] Sistema JWT com cookies seguros
- [x] Armazenamento seguro de tokens
- [x] Validação de tokens
- [x] Logout automático em caso de token inválido

### ✅ Sistema RBAC
- [x] Controle de acesso baseado em papéis
- [x] Redirecionamento automático por papel
- [x] Rotas protegidas
- [x] Dashboard específico para jogadores
- [x] Dashboard específico para donos

### ✅ Segurança
- [x] Cookies seguros (HTTPS em produção)
- [x] Proteção CSRF (SameSite)
- [x] Validação de entrada
- [x] Conformidade LGPD

## 🎯 Fluxo de Teste Completo

1. **Acesse a página de login**
   - URL: `http://localhost:3000`
   - Verifique se a logo aparece
   - Verifique se os campos estão presentes

2. **Teste de validação**
   - Tente enviar formulário vazio
   - Digite email inválido
   - Digite senha curta
   - Não marque o checkbox LGPD

3. **Teste de login como jogador**
   - Email: `jogador@vestiario.com`
   - Senha: `123456`
   - Marque o checkbox LGPD
   - Clique em "Entrar"
   - Deve redirecionar para `/dashboard/player`

4. **Teste de login como dono**
   - Faça logout
   - Email: `dono@vestiario.com`
   - Senha: `123456`
   - Marque o checkbox LGPD
   - Clique em "Entrar"
   - Deve redirecionar para `/dashboard/owner`

5. **Teste de navegação**
   - Tente acessar `/dashboard/player` sem login
   - Deve redirecionar para login
   - Faça login como jogador
   - Tente acessar `/dashboard/owner`
   - Deve redirecionar para `/dashboard/player`

6. **Teste de logout**
   - Clique no ícone de logout
   - Deve redirecionar para login
   - Token deve ser removido

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run preview      # Visualiza build de produção

# Linting
npm run lint         # Executa linter

# Limpar cache
npm cache clean --force
```

## 🐛 Solução de Problemas

### Erro de Permissão (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Porta 3000 em Uso
O Vite automaticamente tentará a próxima porta disponível.

### Problemas com Dependências
```bash
rm -rf node_modules
npm install
```

### Erro de CORS
Em desenvolvimento, o CORS está configurado para `localhost:3000`.

## 📱 Teste em Dispositivos Móveis

1. Execute `npm run dev`
2. Anote o IP local mostrado no terminal
3. Acesse `http://[SEU-IP]:3000` no dispositivo móvel

## 🔧 Personalização

### Alterar Tema
Edite `src/main.jsx`:
```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
})
```

### Alterar Configurações
Edite `src/config/environment.js`:
```javascript
export const appConfig = {
  apiBaseUrl: 'sua-api-url',
  cookieExpiresDays: 7,
  // ...
}
```

## 📊 Estrutura de Arquivos

```
src/
├── components/          # Componentes reutilizáveis
├── hooks/              # Hooks personalizados
├── pages/              # Páginas da aplicação
├── utils/              # Utilitários e APIs
├── theme/              # Tema e cores
├── App.jsx             # Componente principal
└── main.jsx            # Ponto de entrada
```

## 🎉 Próximos Passos

1. **Integrar API Real**: Substitua `mockApi.js` por `api.js`
2. **Adicionar Testes**: Implemente testes unitários e de integração
3. **Deploy**: Configure CI/CD para deploy automático
4. **Monitoramento**: Adicione analytics e error reporting
5. **PWA**: Transforme em Progressive Web App

## 📞 Suporte

Se encontrar problemas:
1. Verifique se Node.js está instalado (versão 16+)
2. Verifique se todas as dependências foram instaladas
3. Consulte a documentação do React e Vite
4. Abra uma issue no repositório

