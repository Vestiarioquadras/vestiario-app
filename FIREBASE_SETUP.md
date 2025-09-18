# 🔥 Guia de Configuração Firebase - Projeto Vestiário

## 📋 Passo a Passo Completo

### **1. Criar Projeto Firebase**

1. **Acesse o Console Firebase:**
   - URL: https://console.firebase.google.com/
   - Clique em "Criar um projeto"

2. **Configurar Projeto:**
   ```
   Nome do projeto: Vestiario App
   ID do projeto: vestiario-app-[seu-id]
   Região: us-central1 (ou escolha a mais próxima)
   ```

3. **Google Analytics:**
   - ✅ Ativar Google Analytics (recomendado)
   - Escolher conta do Google Analytics

### **2. Configurar Authentication**

1. **Acesse Authentication:**
   - No menu lateral: Authentication
   - Clique em "Começar"

2. **Configurar Métodos de Login:**
   - Vá em "Sign-in method"
   - Ative "Email/Password"
   - ✅ Ativar
   - Salvar

3. **Configurar Domínios Autorizados:**
   - Vá em "Settings" > "Authorized domains"
   - Adicione: `localhost` (para desenvolvimento)
   - Adicione seu domínio de produção

### **3. Configurar Firestore Database**

1. **Criar Banco de Dados:**
   - No menu lateral: Firestore Database
   - Clique em "Criar banco de dados"

2. **Modo de Segurança:**
   - Escolha "Modo de teste" (para desenvolvimento)
   - Região: us-central1 (ou escolha a mais próxima)

3. **Configurar Regras de Segurança:**
   - Vá em "Regras"
   - Substitua as regras existentes pelo conteúdo do arquivo `firestore.rules`
   - Clique em "Publicar"

### **4. Configurar Storage (Opcional)**

1. **Acesse Storage:**
   - No menu lateral: Storage
   - Clique em "Começar"

2. **Configurar Regras:**
   - Escolha "Modo de teste"
   - Região: us-central1

### **5. Obter Configurações do Projeto**

1. **Acesse Configurações:**
   - Clique no ícone de engrenagem (Settings)
   - Vá em "Configurações do projeto"

2. **Adicionar App Web:**
   - Na seção "Seus aplicativos"
   - Clique no ícone `</>` (Web)
   - Nome do app: "Vestiario Web"
   - ✅ Configurar Firebase Hosting (opcional)

3. **Copiar Configurações:**
   - Copie o objeto `firebaseConfig`
   - Cole no arquivo `src/config/firebaseConfig.js`

### **6. Atualizar Arquivo de Configuração**

Substitua os valores em `src/config/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "vestiario-app-xxxxx.firebaseapp.com",
  projectId: "vestiario-app-xxxxx",
  storageBucket: "vestiario-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### **7. Testar Configuração**

1. **Instalar Dependências:**
   ```bash
   npm install firebase
   ```

2. **Executar Projeto:**
   ```bash
   npm run dev
   ```

3. **Testar Funcionalidades:**
   - ✅ Cadastro de usuário
   - ✅ Login
   - ✅ Logout
   - ✅ Redirecionamento baseado em role

### **8. Configurar Hosting (Opcional)**

1. **Instalar Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Fazer Login:**
   ```bash
   firebase login
   ```

3. **Inicializar Hosting:**
   ```bash
   firebase init hosting
   ```

4. **Configurar Build:**
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Overwrite index.html: `No`

5. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔒 Configurações de Segurança

### **Regras Firestore**
- ✅ Usuários só acessam seus próprios dados
- ✅ Validação de roles (player/owner)
- ✅ Proteção contra acesso não autorizado
- ✅ Conformidade com LGPD

### **Authentication**
- ✅ Email/Password habilitado
- ✅ Domínios autorizados configurados
- ✅ Regras de senha seguras

### **Storage (se usado)**
- ✅ Apenas usuários autenticados
- ✅ Limite de tamanho de arquivo
- ✅ Tipos de arquivo permitidos

## 📊 Estrutura do Banco de Dados

### **Coleção: users**
```javascript
{
  uid: "user123",
  email: "user@example.com",
  name: "João Silva",
  role: "player", // ou "owner"
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: true
}
```

### **Coleção: courts**
```javascript
{
  name: "Quadra 1",
  sport: "futebol",
  location: "São Paulo, SP",
  ownerId: "owner123",
  createdAt: timestamp,
  isActive: true
}
```

### **Coleção: bookings**
```javascript
{
  playerId: "player123",
  courtId: "court123",
  date: "2024-01-15",
  time: "14:00",
  status: "confirmed",
  createdAt: timestamp
}
```

## 🚀 Próximos Passos

1. ✅ Configurar Firebase
2. ✅ Testar autenticação
3. ✅ Implementar CRUD de quadras
4. ✅ Implementar sistema de reservas
5. ✅ Adicionar notificações
6. ✅ Configurar analytics
7. ✅ Deploy em produção

## 📞 Suporte

- **Documentação Firebase:** https://firebase.google.com/docs
- **Console Firebase:** https://console.firebase.google.com/
- **Firebase Support:** https://firebase.google.com/support

## 🔍 Troubleshooting

### **Erro: "Firebase App named '[DEFAULT]' already exists"**
- Verifique se não há múltiplas inicializações do Firebase
- Use `getApp()` em vez de `initializeApp()` se já existir

### **Erro: "Permission denied"**
- Verifique as regras do Firestore
- Confirme se o usuário está autenticado
- Teste as regras no simulador

### **Erro: "Network request failed"**
- Verifique a conexão com a internet
- Confirme se as configurações estão corretas
- Verifique se o projeto está ativo no Firebase

---

**🎉 Parabéns! Seu projeto Vestiário agora está integrado com Firebase!**
