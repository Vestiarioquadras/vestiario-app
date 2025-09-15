# Guia de Instalação - Vestiário App

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Git**

## 🚀 Passo a Passo da Instalação

### 1. Verificar Pré-requisitos

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version
```

### 2. Instalar Dependências

```bash
# Instalar todas as dependências do projeto
npm install
```

### 3. Executar o Projeto

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

### 4. Acessar a Aplicação

Abra seu navegador e acesse: `http://localhost:3000`

## 🔐 Testando o Sistema

### Credenciais de Teste

**Jogador:**
- Email: `jogador@vestiario.com`
- Senha: `123456`

**Dono:**
- Email: `dono@vestiario.com`
- Senha: `123456`

### Fluxo de Teste

1. Acesse a página de login
2. Digite as credenciais de teste
3. Marque o checkbox de consentimento LGPD
4. Clique em "Entrar"
5. Será redirecionado para o dashboard apropriado baseado no papel

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run preview      # Visualiza o build de produção

# Linting
npm run lint         # Executa o linter
```

## 🔧 Configurações Adicionais

### Personalização do Tema

O tema do Material UI pode ser personalizado no arquivo `src/main.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Cor primária
    },
    secondary: {
      main: '#dc004e', // Cor secundária
    },
  },
})
```

### Configuração da API

Para usar uma API real em produção, substitua o arquivo `src/utils/mockApi.js` por chamadas reais para sua API backend.

## 🐛 Solução de Problemas

### Erro de Permissão no PowerShell

Se encontrar erro de execução de scripts no PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Porta 3000 em Uso

Se a porta 3000 estiver em uso, o Vite automaticamente tentará a próxima porta disponível (3001, 3002, etc.).

### Problemas com Dependências

```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules
npm install
```

## 📱 Testando em Dispositivos Móveis

Para testar em dispositivos móveis na mesma rede:

1. Execute o projeto com `npm run dev`
2. Anote o IP local mostrado no terminal
3. Acesse `http://[SEU-IP]:3000` no dispositivo móvel

## 🚀 Deploy em Produção

### Build de Produção

```bash
npm run build
```

### Servir o Build

```bash
npm run preview
```

### Deploy em Servidores

Os arquivos na pasta `dist/` podem ser servidos por qualquer servidor web estático (Nginx, Apache, etc.).

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique se todos os pré-requisitos estão instalados
2. Consulte a documentação do React e Vite
3. Abra uma issue no repositório do projeto

