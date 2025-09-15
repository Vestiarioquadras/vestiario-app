# 🏗️ Arquitetura do Sistema Vestiário

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Ant Design)           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Mobile    │  │    Web      │  │   PWA       │  │  Admin  │ │
│  │    App      │  │    App      │  │             │  │  Panel  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Auth      │  │   Rate      │  │   Logging   │  │  Cache  │ │
│  │  Service    │  │  Limiting   │  │   Service   │  │  Layer  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │   User      │ │   Booking   │ │   Payment   │ │  Equipment  │ │
│ │  Service    │ │   Service   │ │   Service   │ │   Service   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │  Rating     │ │  Chat       │ │  Notification│ │   Maps      │ │
│ │  Service    │ │  Service    │ │   Service   │ │   Service   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ PostgreSQL  │ │    Redis    │ │   MongoDB   │ │   S3/CDN    │ │
│ │ (Main DB)   │ │   (Cache)   │ │  (Chat/Logs)│ │ (Files)     │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │   Google    │ │   Stripe    │ │  Firebase   │ │   SendGrid  │ │
│ │    Maps     │ │ PagSeguro   │ │ (Push Notif)│ │   (Email)   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🗄️ Esquema do Banco de Dados

### Tabelas Principais

#### Users (Usuários)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('player', 'club_owner', 'trainer', 'admin') NOT NULL,
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Sports (Esportes)
```sql
CREATE TABLE sports (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_players INTEGER NOT NULL,
    max_players INTEGER NOT NULL,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Clubs (Clubes)
```sql
CREATE TABLE clubs (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    owner_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Courts (Quadras)
```sql
CREATE TABLE courts (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    name VARCHAR(255) NOT NULL,
    sport_id UUID REFERENCES sports(id),
    capacity INTEGER NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    is_indoor BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Bookings (Reservas)
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    court_id UUID REFERENCES courts(id),
    user_id UUID REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Player_Ratings (Avaliações de Jogadores)
```sql
CREATE TABLE player_ratings (
    id UUID PRIMARY KEY,
    player_id UUID REFERENCES users(id),
    sport_id UUID REFERENCES sports(id),
    rating DECIMAL(3, 2) NOT NULL,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Equipment (Equipamentos/Uniformes)
```sql
CREATE TABLE equipment (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    name VARCHAR(255) NOT NULL,
    type ENUM('uniform', 'ball', 'racket', 'other') NOT NULL,
    size VARCHAR(50),
    color VARCHAR(50),
    condition ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Equipment_Loans (Empréstimos de Equipamentos)
```sql
CREATE TABLE equipment_loans (
    id UUID PRIMARY KEY,
    equipment_id UUID REFERENCES equipment(id),
    user_id UUID REFERENCES users(id),
    loan_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    status ENUM('active', 'returned', 'overdue') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Fluxos Principais

### 1. Fluxo de Reserva de Quadra
```
Usuário → Busca Quadras → Seleciona Horário → Confirma Reserva → Pagamento → Confirmação
```

### 2. Fluxo de Busca de Partidas
```
Usuário → Define Critérios → Busca Partidas → Solicita Participação → Confirmação → Jogo
```

### 3. Fluxo de Gestão de Uniformes
```
Clube → Cadastra Equipamentos → Usuário Solicita → Empréstimo → Devolução → Avaliação
```

## 🚀 Tecnologias Recomendadas

### Frontend
- **React 18** com TypeScript
- **Ant Design** (já implementado)
- **React Query** para cache de dados
- **React Router** para navegação
- **PWA** com Workbox

### Backend
- **Node.js** com Express ou **Python** com FastAPI
- **TypeScript** para type safety
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Joi** ou **Zod** para validação

### Banco de Dados
- **PostgreSQL** como banco principal
- **Redis** para cache e sessões
- **MongoDB** para logs e chat
- **Prisma** ou **TypeORM** como ORM

### Infraestrutura
- **Docker** para containerização
- **AWS** ou **Google Cloud** para hospedagem
- **Nginx** como reverse proxy
- **PM2** para gerenciamento de processos

### Integrações
- **Google Maps API** para localização
- **Stripe/PagSeguro** para pagamentos
- **Firebase** para notificações push
- **SendGrid** para emails
- **Cloudinary** para imagens

## 📈 Métricas e Analytics

### KPIs Principais
- **Usuários Ativos Mensais (MAU)**
- **Reservas por Mês**
- **Receita por Reserva (ARR)**
- **Taxa de Retenção**
- **NPS (Net Promoter Score)**

### Métricas Técnicas
- **Tempo de Resposta da API**
- **Uptime do Sistema**
- **Taxa de Erro**
- **Performance do Frontend**

---

*Esta arquitetura foi projetada para escalar e suportar milhares de usuários simultâneos, mantendo alta performance e confiabilidade.*

