# 🏆 Vestiário - Plataforma Multi-Esportes

Aplicativo React completo para reserva de quadras esportivas com sistema de pagamentos integrado e gestão avançada para donos de estabelecimentos.

## 🚀 Funcionalidades Implementadas

### 🔐 **Sistema de Autenticação**
- **Login Seguro**: Sistema de autenticação com JWT e cookies seguros
- **RBAC (Role-Based Access Control)**: Controle de acesso baseado em papéis (jogador/dono)
- **Cadastro de Usuários**: Formulário completo com validação
- **Recuperação de Senha**: Sistema de reset de senha
- **Conformidade LGPD**: Consentimento para política de privacidade

### 🏟️ **Sistema de Reservas Completo**
- **Calendário Interativo**: Visualização de disponibilidade em tempo real
- **Cálculo Automático de Preços**: Preço calculado automaticamente baseado na duração e preço por hora
- **Reserva com Pagamento**: Fluxo completo de reserva → pagamento → confirmação
- **Gestão de Status**: Pendente, Confirmada, Cancelada
- **Cancelamento**: Usuários podem cancelar reservas pendentes
- **Histórico de Reservas**: Visualização completa do histórico

### 💳 **Integração de Pagamentos (Stripe)**
- **Formulário de Pagamento**: Interface completa com validação de cartão
- **Processamento Simulado**: Simula integração real com Stripe
- **Confirmação Automática**: Reserva confirmada após pagamento
- **Recibo Digital**: Geração de comprovante de pagamento
- **Validação de Cartão**: Validação em tempo real dos dados

### 🏢 **Dashboard Avançado para Donos**
- **Estatísticas em Tempo Real**: 
  - Total de quadras
  - Reservas do dia
  - Receita mensal
  - Taxa de ocupação
  - Reservas pendentes
- **Gestão de Quadras**: Adicionar, editar, visualizar status
- **Controle de Reservas**: Confirmar/cancelar reservas
- **Agenda Visual**: Calendário com horários ocupados/disponíveis
- **Bloqueio de Horários**: Para manutenção ou eventos especiais
- **Configurações**: Gestão completa do estabelecimento

### 🎨 **Interface e Experiência**
- **Logo Personalizada**: Identidade visual completa com logo laranja (#ff5e0d) e nome integrados
- **Ícones PWA Personalizados**: Logo do Vestiário em todos os ícones do PWA (favicon, app icons, notificações)
- **Tema Harmonioso**: Paleta de cores baseada na cor laranja da logo com cores complementares
- **Design Responsivo**: Interface adaptada para mobile e desktop
- **Gradientes Modernos**: Backgrounds e botões com gradientes harmoniosos
- **Cores Complementares**: Azul, verde e roxo que harmonizam com o laranja principal
- **Notificações**: Feedback visual para todas as ações
- **Validação Robusta**: Formulários com validação completa
- **Tema Consistente**: Design system unificado e profissional

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca principal com hooks modernos
- **Vite** - Build tool e dev server ultra-rápido
- **Ant Design** - Componentes de interface modernos
- **React Router** - Roteamento avançado
- **Day.js** - Manipulação de datas
- **Stripe** - Integração de pagamentos (simulada)
- **js-cookie** - Gerenciamento de cookies seguros

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd VestiarioAPP
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse `http://localhost:3000` no seu navegador

## 🔐 Credenciais de Teste

Para testar o sistema, use as seguintes credenciais:

### 👤 Jogador
- **Email**: `jogador@vestiario.com`
- **Senha**: `123456`
- **Funcionalidades**: Buscar quadras, fazer reservas, pagar, cancelar reservas

### 🏢 Dono de Quadra
- **Email**: `dono@vestiario.com`
- **Senha**: `123456`
- **Funcionalidades**: Gerenciar quadras, confirmar reservas, ver estatísticas, bloquear horários

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ProtectedRoute.jsx
│   ├── PaymentForm.jsx
│   ├── BookingCalendar.jsx
│   ├── Logo.jsx
│   ├── ErrorBoundary.jsx
│   └── PWAInstallPrompt.jsx
├── hooks/              # Hooks personalizados
│   └── useAuth.jsx
├── pages/              # Páginas da aplicação
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── PlayerDashboard.jsx
│   ├── CourtOwnerDashboard.jsx
│   ├── ForgotPasswordPage.jsx
│   └── ResetPasswordPage.jsx
├── utils/              # Utilitários
│   └── mockApi.js      # API mock completa
├── theme/              # Tema e cores
│   ├── vestiarioTheme.js
│   └── colorPalette.js
├── App.jsx             # Componente principal
└── main.jsx            # Ponto de entrada
```

## 🔒 Segurança

- **JWT Tokens**: Autenticação baseada em tokens
- **Cookies Seguros**: Armazenamento seguro de tokens
- **Validação de Entrada**: Validação de formulários
- **Proteção CSRF**: Configuração SameSite nos cookies
- **HTTPS**: Suporte para conexões seguras

## 🎨 Design System

O aplicativo segue as diretrizes do Material Design com:
- Tema personalizado
- Componentes acessíveis
- Layout responsivo
- Feedback visual para ações do usuário

## 📱 Responsividade

O design é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🧪 Como Testar o Sistema

### **Fluxo Completo de Teste**

#### **1. Teste como Jogador:**
1. Faça login com `jogador@vestiario.com`
2. Busque quadras por esporte (ex: Futebol)
3. Clique em "Reservar" em uma quadra
4. Preencha os dados da reserva
5. Clique em "Ir para Pagamento"
6. Use qualquer número de cartão de 16 dígitos
7. Confirme o pagamento
8. Veja a reserva confirmada na lista
9. Teste cancelar uma reserva pendente

#### **2. Teste como Dono:**
1. Faça login com `dono@vestiario.com`
2. Visualize as estatísticas do dashboard
3. Veja a agenda do dia com horários ocupados
4. Confirme reservas pendentes
5. Bloqueie horários para manutenção
6. Adicione novas quadras
7. Configure o estabelecimento

### **Funcionalidades para Testar:**
- ✅ Sistema de autenticação
- ✅ Busca de quadras com filtros
- ✅ Reserva com pagamento
- ✅ Confirmação de reservas
- ✅ Cancelamento de reservas
- ✅ Gestão de quadras
- ✅ Estatísticas em tempo real
- ✅ Bloqueio de horários
- ✅ Interface responsiva

## 🚀 Deploy

Para fazer o build de produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 🔧 Configuração de Produção

Para usar em produção, substitua o arquivo `src/utils/mockApi.js` por chamadas reais para sua API backend.

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@vestiario.com

