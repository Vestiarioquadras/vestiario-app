/**
 * Mock da API de autenticação para demonstração
 * Em produção, substitua por chamadas reais para sua API backend
 */

// Dados mock de usuários para demonstração
const mockUsers = [
  {
    id: 1,
    email: 'jogador@vestiario.com',
    password: '123456',
    role: 'player',
    name: 'João Silva',
    phone: '(11) 99999-9999',
    sports: ['futebol', 'basquete'],
    level: 'intermediario',
    location: 'São Paulo, SP',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=João',
    joinDate: '2024-01-15',
    totalMatches: 45,
    wins: 28,
    losses: 17
  },
  {
    id: 2,
    email: 'dono@vestiario.com',
    password: '123456',
    role: 'court_owner',
    name: 'Maria Santos',
    phone: '(11) 3333-4444',
    courtName: 'Quadras São Paulo',
    location: 'São Paulo, SP',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    joinDate: '2023-11-20',
    totalRevenue: 15420.50,
    totalBookings: 234
  },
  {
    id: 3,
    email: 'pedro@vestiario.com',
    password: '123456',
    role: 'player',
    name: 'Pedro Costa',
    phone: '(11) 88888-7777',
    sports: ['tenis', 'padel'],
    level: 'avancado',
    location: 'Rio de Janeiro, RJ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    joinDate: '2024-02-10',
    totalMatches: 32,
    wins: 24,
    losses: 8
  },
  {
    id: 4,
    email: 'ana@vestiario.com',
    password: '123456',
    role: 'court_owner',
    name: 'Ana Oliveira',
    phone: '(21) 2222-3333',
    courtName: 'Sports Center RJ',
    location: 'Rio de Janeiro, RJ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    joinDate: '2023-09-15',
    totalRevenue: 22350.75,
    totalBookings: 189
  }
]

// Dados mock de esportes
export const mockSports = [
  { id: 1, name: 'Futebol', icon: '⚽', minPlayers: 10, maxPlayers: 22, category: 'Campo' },
  { id: 2, name: 'Futsal', icon: '🥅', minPlayers: 8, maxPlayers: 10, category: 'Quadra' },
  { id: 3, name: 'Basquete', icon: '🏀', minPlayers: 6, maxPlayers: 10, category: 'Quadra' },
  { id: 4, name: 'Vôlei', icon: '🏐', minPlayers: 8, maxPlayers: 12, category: 'Quadra' },
  { id: 5, name: 'Tênis', icon: '🎾', minPlayers: 2, maxPlayers: 4, category: 'Raquete' },
  { id: 6, name: 'Padel', icon: '🏓', minPlayers: 2, maxPlayers: 4, category: 'Raquete' },
  { id: 7, name: 'Handebol', icon: '🤾', minPlayers: 12, maxPlayers: 14, category: 'Quadra' },
  { id: 8, name: 'Badminton', icon: '🏸', minPlayers: 2, maxPlayers: 4, category: 'Raquete' },
  { id: 9, name: 'Squash', icon: '🏏', minPlayers: 2, maxPlayers: 4, category: 'Raquete' },
  { id: 10, name: 'Futebol Americano', icon: '🏈', minPlayers: 20, maxPlayers: 44, category: 'Campo' },
  { id: 11, name: 'Rugby', icon: '🏉', minPlayers: 15, maxPlayers: 30, category: 'Campo' },
  { id: 12, name: 'Hockey', icon: '🏒', minPlayers: 10, maxPlayers: 20, category: 'Quadra' }
]

// Dados mock de quadras/estabelecimentos
export const mockCourts = [
  {
    id: 1,
    name: 'Quadras São Paulo',
    ownerName: 'Maria Santos',
    address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
    phone: '(11) 3333-4444',
    email: 'contato@quadrassp.com',
    sports: ['futebol', 'basquete', 'vôlei'],
    rating: 4.8,
    courts: [
      { id: 1, name: 'Quadra 1 - Futebol', sport: 'futebol', hourlyRate: 150, isIndoor: false, isAvailable: true },
      { id: 2, name: 'Quadra 2 - Basquete', sport: 'basquete', hourlyRate: 120, isIndoor: true, isAvailable: true },
      { id: 3, name: 'Quadra 3 - Vôlei', sport: 'vôlei', hourlyRate: 100, isIndoor: true, isAvailable: false }
    ]
  },
  {
    id: 2,
    name: 'Centro Esportivo Paulista',
    ownerName: 'Carlos Mendes',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    phone: '(11) 2222-3333',
    email: 'info@centroesportivo.com',
    sports: ['tênis', 'padel', 'futsal'],
    rating: 4.6,
    courts: [
      { id: 4, name: 'Quadra Tênis 1', sport: 'tênis', hourlyRate: 80, isIndoor: false, isAvailable: true },
      { id: 5, name: 'Quadra Tênis 2', sport: 'tênis', hourlyRate: 80, isIndoor: false, isAvailable: true },
      { id: 6, name: 'Quadra Padel 1', sport: 'padel', hourlyRate: 90, isIndoor: true, isAvailable: true },
      { id: 7, name: 'Quadra Futsal 1', sport: 'futsal', hourlyRate: 110, isIndoor: true, isAvailable: false }
    ]
  },
  {
    id: 3,
    name: 'Sports Center RJ',
    ownerName: 'Ana Oliveira',
    address: 'Rua da Praia, 456 - Copacabana, Rio de Janeiro - RJ',
    phone: '(21) 2222-3333',
    email: 'contato@sportscenter.com',
    sports: ['basquete', 'vôlei', 'handebol'],
    rating: 4.9,
    courts: [
      { id: 8, name: 'Quadra Basquete Premium', sport: 'basquete', hourlyRate: 180, isIndoor: true, isAvailable: true },
      { id: 9, name: 'Quadra Vôlei 1', sport: 'vôlei', hourlyRate: 140, isIndoor: true, isAvailable: true },
      { id: 10, name: 'Quadra Handebol', sport: 'handebol', hourlyRate: 160, isIndoor: true, isAvailable: true }
    ]
  },
  {
    id: 4,
    name: 'Club de Tênis Elite',
    ownerName: 'Roberto Silva',
    address: 'Av. Atlântica, 789 - Ipanema, Rio de Janeiro - RJ',
    phone: '(21) 3333-4444',
    email: 'info@clubtenis.com',
    sports: ['tênis', 'badminton', 'squash'],
    rating: 4.7,
    courts: [
      { id: 11, name: 'Quadra Tênis VIP', sport: 'tênis', hourlyRate: 200, isIndoor: false, isAvailable: true },
      { id: 12, name: 'Quadra Badminton', sport: 'badminton', hourlyRate: 120, isIndoor: true, isAvailable: true },
      { id: 13, name: 'Quadra Squash', sport: 'squash', hourlyRate: 100, isIndoor: true, isAvailable: true }
    ]
  },
  {
    id: 5,
    name: 'Arena Futebol Total',
    ownerName: 'Fernando Costa',
    address: 'Rua dos Esportes, 321 - Moema, São Paulo - SP',
    phone: '(11) 4444-5555',
    email: 'arena@futeboltotal.com',
    sports: ['futebol', 'futsal'],
    rating: 4.5,
    courts: [
      { id: 14, name: 'Campo Futebol 1', sport: 'futebol', hourlyRate: 250, isIndoor: false, isAvailable: true },
      { id: 15, name: 'Campo Futebol 2', sport: 'futebol', hourlyRate: 250, isIndoor: false, isAvailable: true },
      { id: 16, name: 'Quadra Futsal 1', sport: 'futsal', hourlyRate: 150, isIndoor: true, isAvailable: true },
      { id: 17, name: 'Quadra Futsal 2', sport: 'futsal', hourlyRate: 150, isIndoor: true, isAvailable: false }
    ]
  }
]

// Dados mock de reservas
export const mockBookings = [
  {
    id: 1,
    courtId: 1,
    courtName: 'Quadra 1 - Futebol',
    establishmentName: 'Quadras São Paulo',
    userId: 1,
    userName: 'João Silva',
    startTime: '2024-01-15T19:00:00',
    endTime: '2024-01-15T21:00:00',
    totalPrice: 300,
    status: 'confirmed',
    sport: 'futebol',
    players: ['João Silva', 'Pedro Costa', 'Carlos Santos', 'Miguel Oliveira'],
    notes: 'Partida de futebol entre amigos'
  },
  {
    id: 2,
    courtId: 2,
    courtName: 'Quadra 2 - Basquete',
    establishmentName: 'Quadras São Paulo',
    userId: 1,
    userName: 'João Silva',
    startTime: '2024-01-16T20:00:00',
    endTime: '2024-01-16T22:00:00',
    totalPrice: 240,
    status: 'pending',
    sport: 'basquete',
    players: ['João Silva', 'Ana Costa'],
    notes: 'Treino de basquete'
  },
  {
    id: 3,
    courtId: 4,
    courtName: 'Quadra Tênis 1',
    establishmentName: 'Centro Esportivo Paulista',
    userId: 3,
    userName: 'Pedro Costa',
    startTime: '2024-01-17T18:00:00',
    endTime: '2024-01-17T19:00:00',
    totalPrice: 80,
    status: 'confirmed',
    sport: 'tênis',
    players: ['Pedro Costa', 'Maria Silva'],
    notes: 'Aula de tênis'
  },
  {
    id: 4,
    courtId: 8,
    courtName: 'Quadra Basquete Premium',
    establishmentName: 'Sports Center RJ',
    userId: 1,
    userName: 'João Silva',
    startTime: '2024-01-18T19:30:00',
    endTime: '2024-01-18T21:30:00',
    totalPrice: 360,
    status: 'confirmed',
    sport: 'basquete',
    players: ['João Silva', 'Pedro Costa', 'Ana Costa', 'Carlos Santos'],
    notes: 'Torneio de basquete'
  },
  {
    id: 5,
    courtId: 11,
    courtName: 'Quadra Tênis VIP',
    establishmentName: 'Club de Tênis Elite',
    userId: 3,
    userName: 'Pedro Costa',
    startTime: '2024-01-19T16:00:00',
    endTime: '2024-01-19T18:00:00',
    totalPrice: 400,
    status: 'pending',
    sport: 'tênis',
    players: ['Pedro Costa', 'Roberto Silva'],
    notes: 'Partida de tênis profissional'
  }
]

/**
 * Simula uma requisição de login
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Resposta simulada da API
 */
export const mockLogin = async (email, password) => {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Busca o usuário pelos dados fornecidos
  const user = mockUsers.find(u => u.email === email && u.password === password)

  if (!user) {
    return {
      success: false,
      error: 'Credenciais inválidas'
    }
  }

  // Gera um token JWT mock (em produção, use uma biblioteca real)
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 dias
  }

  // Simula codificação base64 (em produção, use jwt.sign())
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify(tokenPayload))
  const signature = btoa('mock-signature')
  const token = `${header}.${payload}.${signature}`

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  }
}

/**
 * Simula uma requisição de logout
 * @returns {Promise<Object>} Resposta simulada da API
 */
export const mockLogout = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { success: true }
}

/**
 * Simula busca de esportes
 * @returns {Promise<Array>} Lista de esportes
 */
export const mockGetSports = async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockSports
}

/**
 * Simula busca de quadras/estabelecimentos
 * @param {string} sport - Esporte para filtrar (opcional)
 * @param {string} location - Localização para filtrar (opcional)
 * @returns {Promise<Array>} Lista de estabelecimentos com quadras
 */
export const mockGetCourts = async (sport = null, location = null) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  let filteredCourts = mockCourts
  
  if (sport) {
    filteredCourts = filteredCourts.filter(court => 
      court.sports.includes(sport.toLowerCase())
    )
  }
  
  if (location) {
    filteredCourts = filteredCourts.filter(court => 
      court.address.toLowerCase().includes(location.toLowerCase())
    )
  }
  
  return filteredCourts
}

/**
 * Simula busca de reservas do usuário
 * @param {number} userId - ID do usuário
 * @returns {Promise<Array>} Lista de reservas
 */
export const mockGetUserBookings = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  return mockBookings.filter(booking => booking.userId === userId)
}

/**
 * Simula criação de uma nova reserva
 * @param {Object} bookingData - Dados da reserva
 * @returns {Promise<Object>} Resultado da reserva
 */
export const mockCreateBooking = async (bookingData) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const newBooking = {
    id: mockBookings.length + 1,
    ...bookingData,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  mockBookings.push(newBooking)
  
  return {
    success: true,
    booking: newBooking
  }
}

/**
 * Simula busca de reservas para donos de quadras
 * @param {number} ownerId - ID do dono da quadra
 * @returns {Promise<Array>} Lista de reservas do estabelecimento
 */
export const mockGetOwnerBookings = async (ownerId) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Simula reservas para o dono (todas as reservas dos seus estabelecimentos)
  const ownerEstablishments = mockCourts.filter(court => court.ownerName === 'Maria Santos')
  const ownerCourtIds = ownerEstablishments.flatMap(est => est.courts.map(c => c.id))
  
  return mockBookings.filter(booking => ownerCourtIds.includes(booking.courtId))
}

// Dados mock para agenda/horários
export const mockScheduleData = [
  {
    id: 1,
    courtId: 1,
    courtName: 'Quadra 1 - Futebol',
    date: '2024-01-15',
    timeSlots: [
      { time: '08:00', status: 'available', bookingId: null },
      { time: '09:00', status: 'booked', bookingId: 1, clientName: 'João Silva' },
      { time: '10:00', status: 'booked', bookingId: 1, clientName: 'João Silva' },
      { time: '11:00', status: 'blocked', bookingId: null, reason: 'Manutenção' },
      { time: '12:00', status: 'available', bookingId: null },
      { time: '13:00', status: 'available', bookingId: null },
      { time: '14:00', status: 'booked', bookingId: 2, clientName: 'Maria Santos' },
      { time: '15:00', status: 'booked', bookingId: 2, clientName: 'Maria Santos' },
      { time: '16:00', status: 'available', bookingId: null },
      { time: '17:00', status: 'available', bookingId: null },
      { time: '18:00', status: 'blocked', bookingId: null, reason: 'Limpeza' },
      { time: '19:00', status: 'available', bookingId: null },
      { time: '20:00', status: 'available', bookingId: null },
      { time: '21:00', status: 'available', bookingId: null },
      { time: '22:00', status: 'available', bookingId: null }
    ]
  },
  {
    id: 2,
    courtId: 2,
    courtName: 'Quadra 2 - Basquete',
    date: '2024-01-15',
    timeSlots: [
      { time: '08:00', status: 'available', bookingId: null },
      { time: '09:00', status: 'available', bookingId: null },
      { time: '10:00', status: 'booked', bookingId: 3, clientName: 'Pedro Costa' },
      { time: '11:00', status: 'booked', bookingId: 3, clientName: 'Pedro Costa' },
      { time: '12:00', status: 'available', bookingId: null },
      { time: '13:00', status: 'blocked', bookingId: null, reason: 'Evento especial' },
      { time: '14:00', status: 'blocked', bookingId: null, reason: 'Evento especial' },
      { time: '15:00', status: 'available', bookingId: null },
      { time: '16:00', status: 'available', bookingId: null },
      { time: '17:00', status: 'booked', bookingId: 4, clientName: 'Ana Lima' },
      { time: '18:00', status: 'booked', bookingId: 4, clientName: 'Ana Lima' },
      { time: '19:00', status: 'available', bookingId: null },
      { time: '20:00', status: 'available', bookingId: null },
      { time: '21:00', status: 'available', bookingId: null },
      { time: '22:00', status: 'available', bookingId: null }
    ]
  },
  {
    id: 3,
    courtId: 3,
    courtName: 'Quadra 3 - Vôlei',
    date: '2024-01-15',
    timeSlots: [
      { time: '08:00', status: 'blocked', bookingId: null, reason: 'Manutenção' },
      { time: '09:00', status: 'blocked', bookingId: null, reason: 'Manutenção' },
      { time: '10:00', status: 'available', bookingId: null },
      { time: '11:00', status: 'available', bookingId: null },
      { time: '12:00', status: 'available', bookingId: null },
      { time: '13:00', status: 'available', bookingId: null },
      { time: '14:00', status: 'available', bookingId: null },
      { time: '15:00', status: 'available', bookingId: null },
      { time: '16:00', status: 'available', bookingId: null },
      { time: '17:00', status: 'available', bookingId: null },
      { time: '18:00', status: 'available', bookingId: null },
      { time: '19:00', status: 'available', bookingId: null },
      { time: '20:00', status: 'available', bookingId: null },
      { time: '21:00', status: 'available', bookingId: null },
      { time: '22:00', status: 'available', bookingId: null }
    ]
  }
]

/**
 * Simula busca de dados da agenda
 * @param {string} date - Data para buscar (YYYY-MM-DD)
 * @param {number} courtId - ID da quadra (opcional)
 * @returns {Promise<Array>} Dados da agenda
 */
export const mockGetScheduleData = async (date = '2024-01-15', courtId = null) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Se a data for diferente de 2024-01-15, gera dados dinâmicos
  if (date !== '2024-01-15') {
    return generateScheduleForDate(date, courtId)
  }
  
  let filteredData = mockScheduleData.filter(item => item.date === date)
  
  if (courtId) {
    filteredData = filteredData.filter(item => item.courtId === courtId)
  }
  
  return filteredData
}

/**
 * Gera dados de agenda para uma data específica
 * @param {string} date - Data para gerar (YYYY-MM-DD)
 * @param {number} courtId - ID da quadra (opcional)
 * @returns {Array} Dados da agenda gerados
 */
const generateScheduleForDate = (date, courtId = null) => {
  const courts = [
    { id: 1, name: 'Quadra 1 - Futebol' },
    { id: 2, name: 'Quadra 2 - Basquete' },
    { id: 3, name: 'Quadra 3 - Vôlei' }
  ]
  
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ]
  
  const generateTimeSlot = (time) => {
    const random = Math.random()
    if (random < 0.3) {
      // 30% chance de estar reservado
      return {
        time,
        status: 'booked',
        bookingId: Math.floor(Math.random() * 100) + 1,
        clientName: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima', 'Carlos Mendes'][Math.floor(Math.random() * 5)]
      }
    } else if (random < 0.4) {
      // 10% chance de estar bloqueado
      return {
        time,
        status: 'blocked',
        bookingId: null,
        reason: ['Manutenção', 'Limpeza', 'Evento especial', 'Reparo'][Math.floor(Math.random() * 4)]
      }
    } else {
      // 60% chance de estar disponível
      return {
        time,
        status: 'available',
        bookingId: null
      }
    }
  }
  
  let result = courts.map(court => ({
    id: court.id,
    courtId: court.id,
    courtName: court.name,
    date,
    timeSlots: timeSlots.map(generateTimeSlot)
  }))
  
  if (courtId) {
    result = result.filter(item => item.courtId === courtId)
  }
  
  return result
}

/**
 * Simula bloqueio de horário
 * @param {Object} blockData - Dados do bloqueio
 * @returns {Promise<Object>} Resultado do bloqueio
 */
export const mockBlockTimeSlot = async (blockData) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  try {
    // Atualiza os dados mock
    const { courtId, timeSlot, reason, date } = blockData
    
    // Procura o item na agenda
    const scheduleItem = mockScheduleData.find(item => 
      item.courtId === courtId && item.date === date
    )
    
    if (scheduleItem) {
      // Atualiza o timeSlot específico
      const timeSlotIndex = scheduleItem.timeSlots.findIndex(slot => slot.time === timeSlot)
      if (timeSlotIndex !== -1) {
        scheduleItem.timeSlots[timeSlotIndex] = {
          time: timeSlot,
          status: 'blocked',
          bookingId: null,
          reason: reason
        }
      }
    }
    
    return {
      success: true,
      message: 'Horário bloqueado com sucesso!'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao bloquear horário'
    }
  }
}

// Dados mock para quadras favoritas
export const mockFavoriteCourts = [
  {
    id: 1,
    userId: 1,
    courtId: 1,
    courtName: 'Quadra 1 - Futebol',
    establishmentName: 'Quadras São Paulo',
    establishmentId: 1,
    addedDate: '2024-01-10'
  },
  {
    id: 2,
    userId: 1,
    courtId: 4,
    courtName: 'Quadra Tênis 1',
    establishmentName: 'Centro Esportivo Paulista',
    establishmentId: 2,
    addedDate: '2024-01-12'
  }
]

// Dados mock para histórico de partidas
export const mockMatchHistory = [
  {
    id: 1,
    userId: 1,
    courtId: 1,
    courtName: 'Quadra 1 - Futebol',
    establishmentName: 'Quadras São Paulo',
    sport: 'futebol',
    date: '2024-01-14',
    startTime: '19:00',
    endTime: '21:00',
    players: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima'],
    result: 'Vitória',
    score: '3-1',
    duration: 120,
    price: 150
  },
  {
    id: 2,
    userId: 1,
    courtId: 2,
    courtName: 'Quadra 2 - Basquete',
    establishmentName: 'Quadras São Paulo',
    sport: 'basquete',
    date: '2024-01-12',
    startTime: '20:00',
    endTime: '22:00',
    players: ['João Silva', 'Carlos Mendes', 'Roberto Alves'],
    result: 'Derrota',
    score: '45-52',
    duration: 120,
    price: 120
  },
  {
    id: 3,
    userId: 1,
    courtId: 4,
    courtName: 'Quadra Tênis 1',
    establishmentName: 'Centro Esportivo Paulista',
    sport: 'tênis',
    date: '2024-01-10',
    startTime: '18:00',
    endTime: '19:00',
    players: ['João Silva', 'Fernanda Costa'],
    result: 'Vitória',
    score: '6-4, 6-2',
    duration: 60,
    price: 80
  },
  {
    id: 4,
    userId: 1,
    courtId: 3,
    courtName: 'Quadra Padel 1',
    establishmentName: 'Centro Esportivo Paulista',
    sport: 'padel',
    date: '2024-01-08',
    startTime: '16:00',
    endTime: '18:00',
    players: ['João Silva', 'Roberto Alves', 'Maria Santos', 'Ana Lima'],
    result: 'Vitória',
    score: '6-2, 6-4',
    duration: 120,
    price: 100
  },
  {
    id: 5,
    userId: 1,
    courtId: 1,
    courtName: 'Quadra 1 - Futebol',
    establishmentName: 'Quadras São Paulo',
    sport: 'futebol',
    date: '2024-01-06',
    startTime: '19:00',
    endTime: '21:00',
    players: ['João Silva', 'Carlos Mendes', 'Pedro Costa', 'Fernanda Costa'],
    result: 'Derrota',
    score: '2-4',
    duration: 120,
    price: 150
  },
  {
    id: 6,
    userId: 1,
    courtId: 2,
    courtName: 'Quadra 2 - Basquete',
    establishmentName: 'Quadras São Paulo',
    sport: 'basquete',
    date: '2024-01-04',
    startTime: '20:00',
    endTime: '22:00',
    players: ['João Silva', 'Maria Santos', 'Roberto Alves', 'Ana Lima'],
    result: 'Vitória',
    score: '58-45',
    duration: 120,
    price: 120
  },
  {
    id: 7,
    userId: 1,
    courtId: 4,
    courtName: 'Quadra Tênis 1',
    establishmentName: 'Centro Esportivo Paulista',
    sport: 'tênis',
    date: '2024-01-02',
    startTime: '18:00',
    endTime: '19:00',
    players: ['João Silva', 'Fernanda Costa'],
    result: 'Derrota',
    score: '4-6, 2-6',
    duration: 60,
    price: 80
  },
  {
    id: 8,
    userId: 1,
    courtId: 3,
    courtName: 'Quadra Padel 1',
    establishmentName: 'Centro Esportivo Paulista',
    sport: 'padel',
    date: '2023-12-30',
    startTime: '16:00',
    endTime: '18:00',
    players: ['João Silva', 'Roberto Alves', 'Maria Santos', 'Ana Lima'],
    result: 'Vitória',
    score: '6-1, 6-3',
    duration: 120,
    price: 100
  }
]

/**
 * Simula busca de quadras favoritas
 * @param {number} userId - ID do usuário
 * @returns {Promise<Array>} Lista de quadras favoritas
 */
export const mockGetFavoriteCourts = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockFavoriteCourts.filter(fav => fav.userId === userId)
}

/**
 * Simula adição de quadra aos favoritos
 * @param {Object} favoriteData - Dados da quadra favorita
 * @returns {Promise<Object>} Resultado da operação
 */
export const mockAddFavoriteCourt = async (favoriteData) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const newFavorite = {
    id: mockFavoriteCourts.length + 1,
    ...favoriteData,
    addedDate: new Date().toISOString().split('T')[0]
  }
  
  mockFavoriteCourts.push(newFavorite)
  
  return {
    success: true,
    message: 'Quadra adicionada aos favoritos!'
  }
}

/**
 * Simula remoção de quadra dos favoritos
 * @param {number} favoriteId - ID do favorito
 * @returns {Promise<Object>} Resultado da operação
 */
export const mockRemoveFavoriteCourt = async (favoriteId) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  const index = mockFavoriteCourts.findIndex(fav => fav.id === favoriteId)
  if (index > -1) {
    mockFavoriteCourts.splice(index, 1)
  }
  
  return {
    success: true,
    message: 'Quadra removida dos favoritos!'
  }
}

/**
 * Simula busca de histórico de partidas
 * @param {number} userId - ID do usuário
 * @returns {Promise<Array>} Lista de partidas
 */
export const mockGetMatchHistory = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockMatchHistory.filter(match => match.userId === userId)
}

/**
 * Simula registro de novo usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<Object>} Resultado do registro
 */
export const mockRegister = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Verifica se email já existe
  const existingUser = mockUsers.find(user => user.email === userData.email)
  if (existingUser) {
    return {
      success: false,
      error: 'Este email já está cadastrado!'
    }
  }
  
  // Cria novo usuário
  const newUser = {
    id: mockUsers.length + 1,
    email: userData.email,
    password: userData.password,
    role: userData.role,
    name: userData.name,
    phone: userData.phone,
    ...(userData.role === 'player' && { 
      sports: [], 
      level: 'iniciante', 
      location: 'São Paulo, SP' 
    }),
    ...(userData.role === 'court_owner' && { 
      courtName: 'Meu Estabelecimento',
      location: 'São Paulo, SP'
    })
  }
  
  mockUsers.push(newUser)
  
  return {
    success: true,
    message: 'Usuário cadastrado com sucesso!',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }
  }
}

/**
 * Simula envio de email de recuperação de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
export const mockForgotPassword = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Verifica se email existe
  const user = mockUsers.find(user => user.email === email)
  if (!user) {
    return {
      success: false,
      error: 'Email não encontrado em nossa base de dados!'
    }
  }
  
  // Simula envio de email
  return {
    success: true,
    message: 'Email de recuperação enviado com sucesso!',
    email: email
  }
}

/**
 * Simula redefinição de senha
 * @param {string} token - Token de recuperação
 * @param {string} newPassword - Nova senha
 * @returns {Promise<Object>} Resultado da operação
 */
export const mockResetPassword = async (token, newPassword) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Simula validação de token
  if (!token || token !== 'valid-token') {
    return {
      success: false,
      error: 'Token inválido ou expirado!'
    }
  }
  
  // Simula atualização de senha
  return {
    success: true,
    message: 'Senha redefinida com sucesso!'
  }
}

/**
 * Simula processamento de pagamento com Stripe
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} Resultado do pagamento
 */
export const mockProcessPayment = async (paymentData) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simula validação de cartão
  const cardNumber = paymentData.cardNumber.replace(/\s/g, '')
  if (cardNumber.length !== 16) {
    return {
      success: false,
      error: 'Número do cartão inválido'
    }
  }

  // Simula processamento bem-sucedido
  const paymentResult = {
    id: `pi_${Date.now()}`,
    amount: paymentData.amount * 100, // Stripe usa centavos
    currency: 'brl',
    status: 'succeeded',
    paymentMethod: {
      card: {
        brand: 'visa',
        last4: cardNumber.slice(-4)
      }
    },
    created: new Date().toISOString(),
    receipt_url: `https://pay.stripe.com/receipts/${Date.now()}`
  }

  return {
    success: true,
    payment: paymentResult
  }
}

/**
 * Simula criação de reserva com pagamento
 * @param {Object} bookingData - Dados da reserva
 * @param {Object} paymentData - Dados do pagamento
 * @returns {Promise<Object>} Resultado da reserva
 */
export const mockCreateBookingWithPayment = async (bookingData, paymentData) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Processa o pagamento primeiro
  const paymentResult = await mockProcessPayment(paymentData)
  
  if (!paymentResult.success) {
    return {
      success: false,
      error: paymentResult.error
    }
  }

  // Cria a reserva
  const newBooking = {
    id: mockBookings.length + 1,
    ...bookingData,
    status: 'confirmed',
    paymentId: paymentResult.payment.id,
    paymentStatus: 'paid',
    createdAt: new Date().toISOString()
  }
  
  mockBookings.push(newBooking)
  
  return {
    success: true,
    booking: newBooking,
    payment: paymentResult.payment
  }
}

/**
 * Simula busca de disponibilidade de quadra
 * @param {number} courtId - ID da quadra
 * @param {string} date - Data (YYYY-MM-DD)
 * @returns {Promise<Array>} Horários disponíveis
 */
export const mockGetCourtAvailability = async (courtId, date) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simula horários disponíveis (8h às 22h)
  const timeSlots = []
  for (let hour = 8; hour <= 22; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`
    
    // Verifica se há reservas neste horário
    const hasBooking = mockBookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingDate = bookingStart.toISOString().split('T')[0]
      const bookingHour = bookingStart.getHours()
      
      return booking.courtId === courtId && 
             bookingDate === date && 
             bookingHour === hour &&
             booking.status === 'confirmed'
    })
    
    timeSlots.push({
      time,
      hour,
      isAvailable: !hasBooking,
      price: 150 // Preço padrão, pode ser dinâmico
    })
  }
  
  return timeSlots
}

/**
 * Simula cancelamento de reserva
 * @param {number} bookingId - ID da reserva
 * @param {string} reason - Motivo do cancelamento
 * @returns {Promise<Object>} Resultado do cancelamento
 */
export const mockCancelBooking = async (bookingId, reason) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const booking = mockBookings.find(b => b.id === bookingId)
  if (!booking) {
    return {
      success: false,
      error: 'Reserva não encontrada'
    }
  }
  
  // Atualiza status da reserva
  booking.status = 'cancelled'
  booking.cancelledAt = new Date().toISOString()
  booking.cancellationReason = reason
  
  return {
    success: true,
    message: 'Reserva cancelada com sucesso',
    booking
  }
}

/**
 * Simula confirmação de reserva pelo dono
 * @param {number} bookingId - ID da reserva
 * @returns {Promise<Object>} Resultado da confirmação
 */
export const mockConfirmBooking = async (bookingId) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const booking = mockBookings.find(b => b.id === bookingId)
  if (!booking) {
    return {
      success: false,
      error: 'Reserva não encontrada'
    }
  }
  
  booking.status = 'confirmed'
  booking.confirmedAt = new Date().toISOString()
  
  return {
    success: true,
    message: 'Reserva confirmada com sucesso',
    booking
  }
}

/**
 * Simula busca de estatísticas do dono
 * @param {number} ownerId - ID do dono
 * @returns {Promise<Object>} Estatísticas
 */
export const mockGetOwnerStats = async (ownerId) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Busca estabelecimentos do dono
  const ownerEstablishments = mockCourts.filter(court => court.ownerName === 'Maria Santos')
  const ownerCourtIds = ownerEstablishments.flatMap(est => est.courts.map(c => c.id))
  
  // Busca reservas dos estabelecimentos
  const ownerBookings = mockBookings.filter(booking => ownerCourtIds.includes(booking.courtId))
  
  // Calcula estatísticas
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = new Date().toISOString().substring(0, 7)
  
  const stats = {
    totalCourts: ownerEstablishments.reduce((sum, est) => sum + est.courts.length, 0),
    totalBookings: ownerBookings.length,
    bookingsToday: ownerBookings.filter(b => b.startTime.startsWith(today)).length,
    monthlyRevenue: ownerBookings
      .filter(b => b.startTime.startsWith(thisMonth) && b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalPrice, 0),
    occupancyRate: Math.round((ownerBookings.filter(b => b.status === 'confirmed').length / (ownerCourtIds.length * 14)) * 100), // 14 dias
    pendingBookings: ownerBookings.filter(b => b.status === 'pending').length
  }
  
  return stats
}

