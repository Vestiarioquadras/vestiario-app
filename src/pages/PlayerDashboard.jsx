import { useState, useEffect } from 'react'
import {
  Layout,
  Typography,
  Button,
  Space,
  Card,
  Row,
  Col,
  Tag,
  Table,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
  notification,
  Divider,
  Drawer
} from 'antd'
import { 
  UserOutlined, 
  LogoutOutlined, 
  SearchOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ReloadOutlined,
  TrophyOutlined,
  TeamOutlined,
  MenuOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { sportsService, courtsService, bookingsService, favoritesService, matchHistoryService } from '../services/firestoreService'
import PaymentForm from '../components/PaymentForm'
import Logo from '../components/Logo'
import useResponsive from '../hooks/useResponsive'

const { Header, Content } = Layout
const { Title, Text } = Typography

/**
 * Dashboard para usuários com papel de 'player'
 * Exibe funcionalidades para jogadores: busca de clubes, reservas, partidas
 */
const PlayerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isMobile, isTablet, isDesktop, getConfig } = useResponsive()
  const [sports, setSports] = useState([])
  const [courts, setCourts] = useState([])
  const [bookings, setBookings] = useState([])
  const [favoriteCourts, setFavoriteCourts] = useState([])
  const [matchHistory, setMatchHistory] = useState([])
  const [matchHistoryPage, setMatchHistoryPage] = useState(1)
  const [showAllMatches, setShowAllMatches] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    sport: null,
    location: '',
    date: null
  })
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [refreshing] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [selectedFavoriteCourt, setSelectedFavoriteCourt] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [form] = Form.useForm()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  /**
   * Carrega dados iniciais quando o usuário é carregado
   */
  useEffect(() => {
    if (user?.uid) {
    loadInitialData()
    }
  }, [user?.uid])

  const loadInitialData = async () => {
    if (!user?.uid) {
      console.log('⏳ Aguardando usuário carregar...')
      return
    }
    
    setLoading(true)
    try {
      console.log('🔄 Carregando dados para usuário:', user.uid)
      const [sportsData, bookingsData, favoritesData, historyData, courtsData] = await Promise.all([
        sportsService.getAllSports(),
        bookingsService.getUserBookings(user.uid),
        favoritesService.getFavoriteCourts(user.uid),
        matchHistoryService.getMatchHistory(user.uid),
        courtsService.getAllCourts()
      ])
      
      console.log('📊 Dados carregados:', {
        sports: sportsData?.length || 0,
        bookings: bookingsData?.length || 0,
        favorites: favoritesData?.length || 0,
        history: historyData?.length || 0,
        courts: courtsData?.length || 0
      })
      
      setSports(sportsData)
      setBookings(bookingsData)
      setFavoriteCourts(favoritesData)
      setMatchHistory(historyData)
      setCourts(courtsData)
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Processa o placar e determina a cor baseada no resultado
   * @param {string} score - Placar no formato "3-1" ou "6-4, 6-2"
   * @param {string} result - Resultado da partida
   * @returns {Object} Objeto com placar formatado e cor
   */
  const processScore = (score, result) => {
    if (!score) return { formattedScore: '-', color: '#666' }
    
    // Para tênis (formato "6-4, 6-2")
    if (score && score.includes(',')) {
      const sets = score.split(', ')
      const ourSets = sets && sets.filter(set => {
        const [our, opponent] = set.split('-').map(Number)
        return our > opponent
      }).length
      const totalSets = sets.length
      const won = ourSets > totalSets / 2
      return {
        formattedScore: score,
        color: won ? '#10b981' : '#ef4444'
      }
    }
    
    // Para outros esportes (formato "3-1")
    const [ourScore, opponentScore] = score ? score.split('-').map(Number) : [0, 0]
    const won = ourScore > opponentScore
    
    return {
      formattedScore: score,
      color: won ? '#10b981' : '#ef4444'
    }
  }

  /**
   * Busca quadras/estabelecimentos com filtros
   */
  const searchCourts = async () => {
    setLoading(true)
    try {
      const courtsData = await courtsService.getAllCourts(searchFilters.sport, searchFilters.location)
      setCourts(courtsData)
      
      if (courtsData.length === 0) {
        notification.info({
          message: 'Nenhum resultado encontrado',
          description: 'Tente ajustar os filtros de busca',
          placement: 'topRight'
        })
      } else {
        notification.success({
          message: `${courtsData.length} estabelecimento(s) encontrado(s)`,
          description: 'Confira os resultados abaixo',
          placement: 'topRight'
        })
      }
    } catch (error) {
      notification.error({
        message: 'Erro na busca',
        description: 'Não foi possível buscar estabelecimentos',
        placement: 'topRight'
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Manipulador do logout
   */
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  /**
   * Abre modal de reserva
   */
  const openBookingModal = (court) => {
    setSelectedCourt(court)
    setCalculatedPrice(0) // Reseta o preço
    setBookingModalOpen(true)
    
    // Preencher automaticamente o campo courtId
    setTimeout(() => {
      form.setFieldsValue({
        courtId: court.id
      })
    }, 100)
  }

  /**
   * Calcula o preço total baseado na duração e preço por hora
   */
  const calculateTotalPrice = (startTime, endTime, hourlyRate) => {
    if (!startTime || !endTime || !hourlyRate) return 0
    
    const start = new Date(startTime || new Date())
    const end = new Date(endTime || new Date())
    const durationMs = end.getTime() - start.getTime()
    const durationHours = durationMs / (1000 * 60 * 60) // Converter para horas
    
    return Math.round(durationHours * hourlyRate * 100) / 100 // Arredondar para 2 casas decimais
  }

  /**
   * Atualiza o preço quando os campos mudam
   */
  const handleFormValuesChange = (changedValues, allValues) => {
    console.log('Form values changed:', changedValues, allValues)
    
    // Se mudou a quadra, reseta o preço
    if (changedValues.courtId) {
      setCalculatedPrice(0)
      form.setFieldsValue({ totalPrice: 0 })
    }
    
    // Se mudou horários, recalcula o preço
    if ((changedValues.startTime || changedValues.endTime) && 
        allValues.startTime && allValues.endTime && selectedCourt) {
      
      const price = calculateTotalPrice(allValues.startTime, allValues.endTime, selectedCourt.price)
      console.log('Calculated price:', price, 'for court:', selectedCourt.name, 'hourly rate:', selectedCourt.price)
        setCalculatedPrice(price)
        form.setFieldsValue({ totalPrice: price })
    }
  }

  /**
   * Cria nova reserva
   */
  const handleCreateBooking = async (values) => {
    try {
      const calculatedTotalPrice = calculateTotalPrice(values.startTime, values.endTime, selectedCourt.price)
      
      // Valida se o preço foi calculado corretamente
      if (calculatedTotalPrice <= 0) {
        notification.error({
          message: 'Erro no cálculo do preço',
          description: 'Verifique os horários selecionados',
          placement: 'topRight'
        })
        return
      }
      
      // Formatar data e horário corretamente
      const selectedDate = values.startTime ? values.startTime.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0]
      const startTime = values.startTime ? values.startTime.format('HH:mm') : '00:00'
      const endTime = values.endTime ? values.endTime.format('HH:mm') : '00:00'
      
      // Debug: Log dos valores processados
      console.log('🔍 Debug - Valores do formulário:')
      console.log('  values.startTime:', values.startTime)
      console.log('  values.endTime:', values.endTime)
      console.log('  selectedDate:', selectedDate)
      console.log('  formatted startTime:', startTime)
      console.log('  formatted endTime:', endTime)
      
      console.log('🔍 Debug - Valores brutos:')
      console.log('  values.startTime:', values.startTime)
      console.log('  values.endTime:', values.endTime)
      console.log('  startTime.format():', values.startTime ? values.startTime.format('YYYY-MM-DD HH:mm') : 'undefined')
      console.log('  endTime.format():', values.endTime ? values.endTime.format('YYYY-MM-DD HH:mm') : 'undefined')
      
      const bookingData = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        establishmentName: selectedCourt.establishmentName || selectedCourt.name,
        playerId: user.uid,
        playerName: user.displayName || user.email,
        date: selectedDate,
        time: startTime,
        endTime: endTime,
        totalPrice: calculatedTotalPrice,
        price: selectedCourt.price,
        duration: values.startTime && values.endTime ? Math.round((new Date(values.endTime).getTime() - new Date(values.startTime).getTime()) / (1000 * 60 * 60) * 100) / 100 : 0,
        sport: selectedCourt.sport || 'Não informado',
        status: 'pending'
      }
      
      // Debug: Log dos dados finais da reserva
      console.log('📋 Debug - Dados da reserva:')
      console.log('  date:', bookingData.date)
      console.log('  time:', bookingData.time)
      console.log('  endTime:', bookingData.endTime)
      console.log('  totalPrice:', bookingData.totalPrice)
      console.log('  courtName:', bookingData.courtName)
      console.log('  playerName:', bookingData.playerName)

      // Armazena dados da reserva para pagamento
      setSelectedBooking(bookingData)
      setBookingModalOpen(false)
      setPaymentModalOpen(true)
      form.resetFields()

    } catch (error) {
      notification.error({
        message: 'Erro ao criar reserva',
        description: 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Processa pagamento e confirma reserva
   */
  const handlePaymentSuccess = async () => {
    try {
      // Criar dados da reserva para o Firebase
      const bookingData = {
        ...selectedBooking,
        playerId: user.uid,
        playerName: user.displayName || user.email,
        // Usar os dados já processados corretamente
        date: selectedBooking.date,
        time: selectedBooking.time,
        endTime: selectedBooking.endTime,
        price: selectedBooking.totalPrice,
        status: 'pending' // Mudar para 'pending' para que o dono possa confirmar
      }

      // Salvar reserva no Firebase
      await bookingsService.createBooking(bookingData)

        notification.success({
          message: 'Reserva confirmada com sucesso!',
          description: `Quadra ${selectedBooking.courtName} reservada e paga`,
          placement: 'topRight'
        })
        setPaymentModalOpen(false)
        setSelectedBooking(null)
        loadInitialData()
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      notification.error({
        message: 'Erro ao confirmar reserva',
        description: 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Cancela uma reserva
   */
  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingsService.cancelBooking(bookingId)
      
        notification.success({
          message: 'Reserva cancelada!',
          description: 'Sua reserva foi cancelada com sucesso',
          placement: 'topRight'
        })
      
      // Recarregar dados para refletir as mudanças
        loadInitialData()
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error)
      notification.error({
        message: 'Erro ao cancelar reserva',
        description: 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Adiciona quadra aos favoritos
   */
  const handleAddToFavorites = async (court) => {
    try {
      const favoriteData = {
        userId: user.uid,
        courtId: court.id,
        courtName: court.name,
        establishmentName: court.establishmentName || court.name,
        sport: court.sport,
        price: court.price,
        isIndoor: court.isIndoor || false,
        rating: court.rating || 0
      }

      await favoritesService.addFavoriteCourt(user.uid, court.id, favoriteData)
      
      notification.success({
        message: 'Quadra adicionada aos favoritos!',
        description: `${court.name} foi adicionada aos seus favoritos`,
        placement: 'topRight'
      })
      loadInitialData()
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error)
      notification.error({
        message: 'Erro ao adicionar aos favoritos',
        description: 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Remove quadra dos favoritos
   */
  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      // Encontrar o favorito para obter o courtId
      const favorite = favoriteCourts && favoriteCourts.find(fav => fav.id === favoriteId)
      if (!favorite) {
        notification.error({
          message: 'Favorito não encontrado',
          description: 'Tente novamente',
          placement: 'topRight'
        })
        return
      }

      await favoritesService.removeFavoriteCourt(user.uid, favorite.courtId)
      
      notification.success({
        message: 'Quadra removida dos favoritos!',
        description: 'A quadra foi removida da sua lista de favoritos',
        placement: 'topRight'
      })
      loadInitialData()
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
      notification.error({
        message: 'Erro ao remover dos favoritos',
        description: 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Verifica se uma quadra está nos favoritos
   */
  const isFavorite = (courtId) => {
    return favoriteCourts && favoriteCourts.some(fav => fav.courtId === courtId)
  }

  /**
   * Redireciona para reserva a partir dos favoritos
   */
  const handleReserveFromFavorites = async (favorite) => {
    try {
      // Recarrega todas as quadras disponíveis
      const courtsData = await courtsService.getAllCourts()
      setCourts(courtsData)
      
      // Encontra a quadra completa nos dados carregados
      const fullCourtData = courtsData.find(court => court.id === favorite.courtId)
      
      if (!fullCourtData) {
        notification.error({
          message: 'Quadra não encontrada',
          description: 'A quadra favorita não está mais disponível',
          placement: 'topRight'
        })
        return
      }
      
      // Define a quadra como selecionada
      setSelectedCourt(fullCourtData)
      
      // Abre o modal de reserva diretamente
      setBookingModalOpen(true)
      
      // Pré-preenche o formulário com os dados da quadra
      form.setFieldsValue({
        courtId: fullCourtData.id,
        date: null, // Deixa vazio para o usuário escolher
        startTime: null,
        endTime: null
      })
      
      notification.success({
        message: 'Modal de reserva aberto!',
        description: `Pronto para reservar ${favorite.courtName}. Escolha a data e horário.`,
        placement: 'topRight',
        duration: 3
      })
    } catch (error) {
      console.error('Erro ao abrir reserva de favorito:', error)
      notification.error({
        message: 'Erro ao abrir reserva',
        description: 'Não foi possível abrir o modal de reserva',
        placement: 'topRight'
      })
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)', 
        padding: isMobile ? '0 16px' : '0 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: isMobile ? '64px' : '72px',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              style={{ 
                marginRight: '12px',
                borderRadius: '8px',
                height: '40px',
                width: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          )}
          <Logo size={isMobile ? "small" : "medium"} style={{ marginRight: isMobile ? '12px' : '20px' }} />
            <div>
            <Title level={4} style={{ 
              margin: 0, 
              color: '#ff5e0e',
              fontWeight: '600',
              fontSize: isMobile ? '16px' : '20px',
              lineHeight: 1.2
            }}>
                Dashboard do Jogador
              </Title>
            <Text type="secondary" style={{ 
              fontSize: isMobile ? '12px' : '14px',
              lineHeight: 1.2,
              display: 'block'
            }}>
                Olá, {user?.name || user?.email}!
              </Text>
            </div>
        </div>
        
        <Button 
          type="primary" 
          danger 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          size={isMobile ? "small" : "middle"}
          style={{
            borderRadius: '8px',
            fontWeight: '500',
            height: isMobile ? '36px' : '40px',
            paddingInline: isMobile ? '12px' : '16px'
          }}
        >
          {isMobile ? 'Sair' : 'Sair'}
        </Button>
      </Header>

      {/* Conteúdo Principal */}
      <Content style={{ 
        padding: isMobile ? '20px 16px' : isTablet ? '24px 20px' : '32px 24px', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: 'calc(100vh - 72px)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto'
        }}>
          {/* Boas-vindas */}
          <Card style={{ 
            marginBottom: isMobile ? '20px' : '32px', 
            background: 'linear-gradient(135deg, #ff5e0e 0%, #ff8c42 100%)',
            border: 'none',
            color: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 15px -3px rgba(255, 94, 14, 0.3), 0 4px 6px -2px rgba(255, 94, 14, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Efeito de fundo decorativo */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              zIndex: 1
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-30%',
              left: '-10%',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              zIndex: 1
            }} />
            
            <div style={{ 
              display: 'flex', 
              alignItems: isMobile ? 'flex-start' : 'center', 
              marginBottom: '16px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left',
              position: 'relative',
              zIndex: 2
            }}>
              {isMobile && (
                <div style={{ marginBottom: '12px' }}>
                  <Title level={3} style={{ margin: 0, color: 'white', fontWeight: '600' }}>
                    Olá, {user?.name || 'Jogador'}! 👋
                  </Title>
                </div>
              )}
              <Logo size={isMobile ? "medium" : "large"} style={{ 
                marginRight: isMobile ? '0' : '20px',
                marginBottom: isMobile ? '12px' : '0',
                filter: 'brightness(0) invert(1)'
              }} />
              <div>
                <Title level={isMobile ? 3 : 2} style={{ margin: 0, color: 'white', fontWeight: '600' }}>
                  Encontre seu esporte! 🏆
                </Title>
                <Text style={{ 
                  fontSize: isMobile ? '14px' : '16px',
                  display: isMobile ? 'block' : 'inline',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '400'
                }}>
                  Busque estabelecimentos, reserve quadras e conecte-se com outros jogadores.
                </Text>
              </div>
            </div>
          </Card>

          {/* BARRA DE PESQUISA GRANDE E CLARA */}
          <Card id="search-section" style={{ 
            marginBottom: isMobile ? '20px' : '32px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.3), 0 4px 6px -2px rgba(102, 126, 234, 0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Efeito de fundo decorativo */}
            <div style={{
              position: 'absolute',
              top: '-30%',
              right: '-15%',
              width: '150px',
              height: '150px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              zIndex: 1
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-20%',
              left: '-10%',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              zIndex: 1
            }} />
            
            <Row gutter={isMobile ? [8, 8] : [16, 16]} align="middle" style={{ position: 'relative', zIndex: 2 }}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ 
                    color: 'white', 
                    fontSize: isMobile ? '14px' : '16px', 
                    fontWeight: 'bold' 
                  }}>
                    🏃‍♂️ Esporte
                  </Text>
                  <br />
                  <Select
                    placeholder="Selecione o esporte"
                    style={{ 
                      width: '100%', 
                      height: isMobile ? '44px' : '52px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                    size={isMobile ? "middle" : "large"}
                    value={searchFilters.sport}
                    onChange={(value) => setSearchFilters({...searchFilters, sport: value})}
                  >
                    {sports && sports.map(sport => (
                      <Select.Option key={sport.id} value={sport.name}>
                        {sport.icon} {sport.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                    📍 Localização
                  </Text>
                  <br />
                  <Select
                    placeholder="Selecione o estado"
                    value={searchFilters.location}
                    onChange={(value) => setSearchFilters({...searchFilters, location: value})}
                    style={{ 
                      height: isMobile ? '44px' : '52px', 
                      fontSize: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      width: '100%'
                    }}
                    size={isMobile ? "middle" : "large"}
                    suffixIcon={<EnvironmentOutlined style={{ color: 'white' }} />}
                  >
                    <Select.Option value="">Todos os estados</Select.Option>
                    <Select.Option value="São Paulo">São Paulo</Select.Option>
                    <Select.Option value="Rio de Janeiro">Rio de Janeiro</Select.Option>
                    <Select.Option value="Minas Gerais">Minas Gerais</Select.Option>
                    <Select.Option value="Bahia">Bahia</Select.Option>
                    <Select.Option value="Paraná">Paraná</Select.Option>
                    <Select.Option value="Rio Grande do Sul">Rio Grande do Sul</Select.Option>
                    <Select.Option value="Pernambuco">Pernambuco</Select.Option>
                    <Select.Option value="Ceará">Ceará</Select.Option>
                    <Select.Option value="Pará">Pará</Select.Option>
                    <Select.Option value="Santa Catarina">Santa Catarina</Select.Option>
                    <Select.Option value="Goiás">Goiás</Select.Option>
                    <Select.Option value="Maranhão">Maranhão</Select.Option>
                    <Select.Option value="Paraíba">Paraíba</Select.Option>
                    <Select.Option value="Espírito Santo">Espírito Santo</Select.Option>
                    <Select.Option value="Piauí">Piauí</Select.Option>
                    <Select.Option value="Alagoas">Alagoas</Select.Option>
                    <Select.Option value="Tocantins">Tocantins</Select.Option>
                    <Select.Option value="Rio Grande do Norte">Rio Grande do Norte</Select.Option>
                    <Select.Option value="Acre">Acre</Select.Option>
                    <Select.Option value="Amapá">Amapá</Select.Option>
                    <Select.Option value="Amazonas">Amazonas</Select.Option>
                    <Select.Option value="Mato Grosso">Mato Grosso</Select.Option>
                    <Select.Option value="Mato Grosso do Sul">Mato Grosso do Sul</Select.Option>
                    <Select.Option value="Rondônia">Rondônia</Select.Option>
                    <Select.Option value="Roraima">Roraima</Select.Option>
                    <Select.Option value="Sergipe">Sergipe</Select.Option>
                    <Select.Option value="Distrito Federal">Distrito Federal</Select.Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                    📅 Data
                  </Text>
                  <br />
                  <DatePicker
                    style={{ 
                      width: '100%', 
                      height: isMobile ? '44px' : '52px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                    size="large"
                    placeholder="Selecione a data"
                    value={searchFilters.date}
                    onChange={(date) => setSearchFilters({...searchFilters, date})}
                  />
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                    🔍 Buscar
                  </Text>
                  <br />
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<SearchOutlined />}
                      onClick={searchCourts}
                      loading={loading}
                      style={{ 
                        height: isMobile ? '44px' : '52px', 
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ff5e0e 0%, #ff8c42 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(255, 94, 14, 0.3)',
                        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 6px 16px rgba(255, 94, 14, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 4px 12px rgba(255, 94, 14, 0.3)'
                      }}
                    >
                      Buscar Quadras
                    </Button>
                    <Button 
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={loadInitialData}
                      loading={refreshing}
                      style={{ 
                        width: '100%',
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white'
                      }}
                    >
                      Atualizar
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Indicador de Quadra Favorita Selecionada */}
          {selectedFavoriteCourt && (
            <Card style={{ 
              marginBottom: '24px', 
              background: 'linear-gradient(135deg, #ff5e0e 0%, #ff8c42 100%)',
              border: '2px solid #ff5e0e'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginRight: '12px' }}>
                    ⭐ Quadra Favorita Selecionada
                  </Text>
                  <Text style={{ color: 'white', fontSize: '16px' }}>
                    {selectedFavoriteCourt.courtName} - {selectedFavoriteCourt.establishmentName}
                  </Text>
                </div>
                <Button 
                  type="text" 
                  style={{ color: 'white' }}
                  onClick={() => setSelectedFavoriteCourt(null)}
                >
                  ✕
                </Button>
              </div>
            </Card>
          )}

          {/* Quadras Favoritas */}
          <Card title="⭐ Quadras Favoritas" style={{ marginBottom: '24px' }}>
            {favoriteCourts && favoriteCourts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {favoriteCourts && favoriteCourts.map(favorite => (
                  <Col xs={24} sm={12} md={8} key={favorite.id}>
                    <Card 
                      size="small"
                      title={favorite.courtName}
                      extra={
                        <Button 
                          size="small" 
                          danger 
                          icon={<HeartFilled />}
                          onClick={() => handleRemoveFromFavorites(favorite.id)}
                        >
                          Remover
                        </Button>
                      }
                      style={{ border: '2px solid #ff4d4f' }}
                    >
                      <div>
                        <Text strong>🏢 {favorite.establishmentName}</Text>
                        <br />
                        <Text type="secondary">
                          Adicionado em: {favorite.createdAt ? new Date(favorite.createdAt.toDate ? favorite.createdAt.toDate() : favorite.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                        </Text>
                        <br />
                        <Text strong>Esporte:</Text> <Tag color="blue">{favorite.sport || 'Não informado'}</Tag>
                        <br />
                        <Text strong>Preço:</Text> R$ {favorite.price || 'Não informado'}/hora
                        <br />
                        <Text strong>Tipo:</Text> {favorite.isIndoor ? 'Coberta' : 'Descoberta'}
                        <br />
                        <Text strong>Rating:</Text> ⭐ {favorite.rating || 0}/5.0
                        <br />
                        <Button 
                          type="primary" 
                          size="small" 
                          icon={<PlusOutlined />}
                          style={{ marginTop: '8px' }}
                          block
                          onClick={() => handleReserveFromFavorites(favorite)}
                        >
                          Reservar Agora
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <HeartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <br />
                <Text type="secondary">Nenhuma quadra favorita ainda</Text>
                <br />
                <Text type="secondary">Adicione quadras aos favoritos para acesso rápido!</Text>
              </div>
            )}
          </Card>

          {/* Lista de Estabelecimentos */}
          {courts && courts.length > 0 && (
            <Card title="Estabelecimentos Encontrados" style={{ marginBottom: '24px' }}>
              <Row gutter={[16, 16]}>
                {courts && courts.map(court => (
                  <Col xs={24} md={12} key={court.id}>
                    <Card 
                      hoverable
                      actions={[
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => openBookingModal(court)}
                        >
                          Reservar
                        </Button>,
                        <Button 
                          type={isFavorite(court.id) ? "default" : "dashed"}
                          icon={isFavorite(court.id) ? <HeartFilled /> : <HeartOutlined />}
                          onClick={() => isFavorite(court.id) ? 
                            handleRemoveFromFavorites(favoriteCourts && favoriteCourts.find(fav => fav.courtId === court.id)?.id) : 
                            handleAddToFavorites(court)
                          }
                        >
                          {isFavorite(court.id) ? 'Favorito' : 'Favoritar'}
                        </Button>
                      ]}
                    >
                      <div>
                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                          {court.name}
                        </Title>
                        <Text type="secondary">
                          <EnvironmentOutlined /> {court.address}
                        </Text>
                        <br />
                        <Text type="secondary">
                          <TeamOutlined /> {court.sports ? court.sports.join(', ') : court.sport || 'Não informado'}
                        </Text>
                        <br />
                        <Text type="secondary">
                          ⭐ {court.rating}/5.0
                        </Text>
                        <Divider style={{ margin: '12px 0' }} />
                        <Text strong>Preço:</Text> R$ {court.price}/hora
                        <br />
                        <Text strong>Status:</Text> 
                                  <Tag color="green" style={{ marginLeft: '8px' }}>Disponível</Tag>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Minhas Reservas */}
          <Card title="📅 Minhas Reservas" style={{ marginBottom: isMobile ? '16px' : '24px' }}>
            {isMobile ? (
              // Layout mobile com cards
              <div>
                {bookings && bookings.map(booking => (
                  <Card 
                    key={booking.id} 
                    size="small" 
                    style={{ marginBottom: '12px' }}
                    title={booking.courtName}
                  >
                    <div style={{ fontSize: '14px' }}>
                      <div><strong>🏢</strong> {booking.establishmentName}</div>
                      <div><strong>📅</strong> {booking.date ? booking.date.split('-').reverse().join('/') : 'Data não disponível'}</div>
                      <div><strong>⏰</strong> {booking.time}</div>
                      <div><strong>💰</strong> R$ {booking.totalPrice?.toFixed(2)}</div>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color={booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'orange' : 'red'}>
                          {booking.status === 'confirmed' ? 'Confirmada' : booking.status === 'pending' ? 'Pendente' : 'Cancelada'}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              // Layout desktop com tabela
              <Table
                dataSource={bookings}
                columns={[
                  {
                    title: 'Quadra',
                    dataIndex: 'courtName',
                    key: 'courtName',
                  },
                  {
                    title: 'Estabelecimento',
                  dataIndex: 'establishmentName',
                  key: 'establishmentName',
                },
                {
                  title: 'Esporte',
                  dataIndex: 'sport',
                  key: 'sport',
                  render: (sport) => <Tag color="blue">{sport}</Tag>
                },
                {
                  title: 'Data/Hora',
                  key: 'datetime',
                  render: (_, record) => (
                    <div>
                      <Text>{record.date ? record.date.split('-').reverse().join('/') : 'Data não disponível'}</Text>
                      <br />
                      <Text type="secondary">
                        <ClockCircleOutlined /> {record.time}
                      </Text>
                    </div>
                  )
                },
                {
                  title: 'Valor',
                  dataIndex: 'totalPrice',
                  key: 'totalPrice',
                  render: (price) => <Text strong>R$ {price}</Text>
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'confirmed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
                      {status === 'confirmed' ? 'Confirmada' : status === 'pending' ? 'Pendente' : 'Cancelada'}
                    </Tag>
                  )
                },
                {
                  title: 'Ações',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      {record.status === 'pending' && (
                        <Button 
                          size="small" 
                          danger
                          onClick={() => handleCancelBooking(record.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                      {record.status === 'confirmed' && (
                        <Button 
                          size="small" 
                          type="primary"
                          onClick={() => {
                            // Aqui poderia abrir detalhes da reserva
                            message.info('Reserva confirmada!')
                          }}
                        >
                          Ver Detalhes
                        </Button>
                      )}
                    </Space>
                  )
                }
              ]}
              pagination={false}
            />
            )}
          </Card>

          {/* Histórico de Partidas - Versão Minimalista */}
          <Card title="🏆 Histórico de Partidas">
            {matchHistory && matchHistory.length > 0 ? (
                <div>
                {/* Tabela simplificada */}
                <Table
                  dataSource={showAllMatches ? matchHistory : matchHistory?.slice(0, 5) || []}
                  columns={[
                  {
                    title: 'Quadra',
                    dataIndex: 'courtName',
                    key: 'courtName',
                      render: (courtName) => (
                        <Text style={{ fontWeight: 500 }}>{courtName}</Text>
                      )
                  },
                  {
                    title: 'Esporte',
                    dataIndex: 'sport',
                    key: 'sport',
                      render: (sport) => (
                        <Tag 
                          color="blue" 
                          style={{ 
                            textTransform: 'capitalize',
                            fontWeight: 500,
                            borderRadius: '12px'
                          }}
                        >
                          {sport}
                      </Tag>
                    )
                  },
                  {
                    title: 'Placar',
                    key: 'score',
                      render: (_, record) => {
                        const score = `${record.playerScore}-${record.opponentScore}`
                        const { formattedScore, color } = processScore(score, record.result)
                        return (
                          <Text 
                            strong 
                            style={{ 
                              color: color,
                              fontSize: '16px',
                              fontWeight: 600
                            }}
                          >
                            {formattedScore}
                          </Text>
                        )
                      }
                    }
                  ]}
                  pagination={false}
                size="middle"
                  rowKey="id"
                  style={{ marginBottom: '16px' }}
                />

                {/* Controles de paginação */}
                {matchHistory && matchHistory.length > 5 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px 0',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    {!showAllMatches ? (
                      <Button 
                        type="link" 
                        onClick={() => setShowAllMatches(true)}
                        style={{ 
                          color: '#ff5e0e',
                          fontWeight: 500
                        }}
                      >
                        Ver mais partidas ({(matchHistory?.length || 0) - 5} restantes)
                      </Button>
                    ) : (
                      <Button 
                        type="link" 
                        onClick={() => setShowAllMatches(false)}
                        style={{ 
                          color: '#6b7280',
                          fontWeight: 500
                        }}
                      >
                        Ver menos partidas
                      </Button>
                    )}
                    
                    {matchHistory && matchHistory.length > 10 && (
                      <div style={{ 
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#9ca3af'
                      }}>
                        Mostrando {Math.min(matchHistory?.length || 0, 10)} de {matchHistory?.length || 0} partidas
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: isMobile ? '20px' : '40px' }}>
                <TrophyOutlined style={{ fontSize: isMobile ? '32px' : '48px', color: '#d9d9d9' }} />
                <br />
                <Text type="secondary" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                  Nenhuma partida registrada ainda
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                  Suas partidas aparecerão aqui após serem finalizadas!
                </Text>
              </div>
            )}
          </Card>
        </div>

        {/* Modal de Reserva */}
        <Modal
          title={`Reservar Quadra - ${selectedCourt?.name}`}
          open={bookingModalOpen}
          onCancel={() => setBookingModalOpen(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateBooking}
            onValuesChange={handleFormValuesChange}
          >
            <Form.Item
              name="courtId"
              label="Quadra"
              rules={[{ required: true, message: 'Selecione uma quadra!' }]}
            >
              <Select placeholder="Selecione a quadra">
                <Select.Option key={selectedCourt?.id} value={selectedCourt?.id}>
                  {selectedCourt?.name} - R$ {selectedCourt?.price}/hora
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="sport"
              label="Esporte"
              rules={[{ required: true, message: 'Selecione o esporte!' }]}
            >
              <Select placeholder="Selecione o esporte">
                {sports && sports.map(sport => (
                  <Select.Option key={sport.id} value={sport.name}>
                    {sport.icon} {sport.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startTime"
                  label="Data e Hora Início"
                  rules={[{ required: true, message: 'Selecione a data e hora!' }]}
                >
                  <DatePicker 
                    showTime 
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endTime"
                  label="Data e Hora Fim"
                  rules={[{ required: true, message: 'Selecione a data e hora!' }]}
                >
                  <DatePicker 
                    showTime 
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="totalPrice"
              label="Valor Total (Calculado Automaticamente)"
              initialValue={0}
              rules={[
                { 
                  validator: (_, value) => {
                    if (value <= 0) {
                      return Promise.reject(new Error('Selecione uma quadra e horários para calcular o preço'))
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input 
                prefix="R$" 
                placeholder="0.00"
                readOnly
                style={{ 
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed'
                }}
              />
            </Form.Item>
            
            {calculatedPrice > 0 && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '6px',
                border: '1px solid #bae6fd',
                marginBottom: '16px'
              }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 <strong>Cálculo Automático:</strong> R$ {selectedCourt?.price || 0} por hora × {calculatedPrice > 0 ? (calculatedPrice / (selectedCourt?.price || 1)).toFixed(1) : 0} horas = R$ {calculatedPrice.toFixed(2)}
                </Text>
              </div>
            )}

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setBookingModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  disabled={calculatedPrice <= 0}
                >
                  Ir para Pagamento (R$ {calculatedPrice.toFixed(2)})
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal de Pagamento */}
        <PaymentForm
          visible={paymentModalOpen}
          onCancel={() => {
            setPaymentModalOpen(false)
            setSelectedBooking(null)
          }}
          onSuccess={handlePaymentSuccess}
          bookingData={selectedBooking}
          totalAmount={selectedBooking?.totalPrice}
        />

        {/* Drawer Mobile */}
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
        >
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <Logo size="medium" />
              <Title level={4} style={{ margin: '12px 0 0 0', color: '#ff5e0e' }}>
                Olá, {user?.name || 'Jogador'}! 👋
              </Title>
              <Text type="secondary">
                Encontre quadras e reserve seu horário
              </Text>
            </div>
            
            <Divider />
            
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                danger 
                icon={<LogoutOutlined />}
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                block
              >
                Sair
              </Button>
            </Space>
          </div>
        </Drawer>
      </Content>
    </Layout>
  )
}

export default PlayerDashboard