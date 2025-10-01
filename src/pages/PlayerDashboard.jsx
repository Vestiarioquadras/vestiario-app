import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
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
  Drawer,
  Spin
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
import { sportsService, courtsService, bookingsService, favoritesService, matchHistoryService, availabilityService } from '../services/firestoreService'
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
  const [selectedDate, setSelectedDate] = useState(null)
  const [courtsWithAvailability, setCourtsWithAvailability] = useState([])
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [refreshing] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [selectedFavoriteCourt, setSelectedFavoriteCourt] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  const [form] = Form.useForm()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)

  /**
   * Carrega dados iniciais quando o usuário é carregado
   */
  useEffect(() => {
    if (user?.uid) {
      loadInitialData()
    }
  }, [user?.uid])

  /**
   * Atualiza disponibilidade automaticamente quando a data ou filtros mudam
   * Jogadores não precisam clicar em "Atualizar" - tudo é automático!
   */
  useEffect(() => {
    if (user?.uid) {
      console.log('🔄 Atualização automática para jogador:', { selectedDate, filters: searchFilters })
      loadAvailabilityData()
    }
  }, [selectedDate, searchFilters.sport, searchFilters.location])

  /**
   * Atualização automática a cada 5 minutos para jogadores
   * Mantém dados sempre atualizados sem intervenção manual
   */
  useEffect(() => {
    if (!user?.uid) return

    const interval = setInterval(() => {
      console.log('🔄 Atualização automática de dados para jogador')
      loadInitialData()
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
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
        availabilityService.getCourtsWithAvailability(
          selectedDate ? selectedDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0], 
          searchFilters.sport, 
          searchFilters.location
        )
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
      setCourtsWithAvailability(courtsData)
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega dados de disponibilidade para a data selecionada
   */
  const loadAvailabilityData = async () => {
    try {
      const dateString = selectedDate ? selectedDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0]
      console.log('🔄 Carregando disponibilidade para:', dateString)
      const courtsData = await availabilityService.getCourtsWithAvailability(
        dateString, 
        searchFilters.sport, 
        searchFilters.location
      )
      
      console.log(`✅ Encontradas ${courtsData.length} quadras com disponibilidade`)
      setCourtsWithAvailability(courtsData)
    } catch (error) {
      console.error('❌ Erro ao carregar disponibilidade:', error)
      message.error('Erro ao carregar disponibilidade')
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
      console.log('🔍 Buscando quadras com disponibilidade:', { 
        date: selectedDate ? selectedDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0], 
        sport: searchFilters.sport, 
        location: searchFilters.location 
      })
      
      const dateString = selectedDate ? selectedDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0]
      const courtsData = await availabilityService.getCourtsWithAvailability(
        dateString, 
        searchFilters.sport, 
        searchFilters.location
      )
      
      setCourtsWithAvailability(courtsData)
      
      if (courtsData.length === 0) {
        notification.info({
          message: 'Nenhuma quadra disponível',
          description: 'Não há horários livres para esta data. Tente outra data ou ajuste os filtros.',
          placement: 'topRight'
        })
      } else {
        notification.success({
          message: `${courtsData.length} quadras encontradas`,
          description: `Encontradas ${courtsData.length} quadras com horários disponíveis para ${selectedDate ? selectedDate.format('DD/MM/YYYY') : 'hoje'}`,
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
   * Carrega horários disponíveis para uma data específica
   */
  const loadTimeSlotsForDate = async (courtId, date) => {
    setLoadingTimeSlots(true)
    try {
      const dateString = date.format('YYYY-MM-DD')
      console.log('🔍 Carregando horários disponíveis para:', { courtId, date: dateString })
      
      const timeSlots = await availabilityService.getAvailableTimeSlots(courtId, dateString)
      setAvailableTimeSlots(timeSlots)
      
      console.log(`✅ Encontrados ${timeSlots.length} horários disponíveis para ${dateString}`)
    } catch (error) {
      console.error('❌ Erro ao carregar horários disponíveis:', error)
      setAvailableTimeSlots([])
    } finally {
      setLoadingTimeSlots(false)
    }
  }

  /**
   * Abre modal de reserva
   */
  const openBookingModal = async (court) => {
    setSelectedCourt(court)
    setCalculatedPrice(0) // Reseta o preço
    setAvailableTimeSlots([]) // Limpa horários anteriores
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
    
    // Se são strings (horários do seletor), converter para objetos Date
    let start, end
    
    // Obter a data do formulário ou usar a data selecionada globalmente
    const formData = form.getFieldsValue()
    const bookingDate = formData.bookingDate ? formData.bookingDate.format('YYYY-MM-DD') : (selectedDate ? selectedDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0])
    
    if (typeof startTime === 'string') {
      // Formato "HH:mm" - usar a data do formulário
      start = new Date(`${bookingDate} ${startTime}`)
    } else {
      start = new Date(startTime || new Date())
    }
    
    if (typeof endTime === 'string') {
      // Formato "HH:mm" - usar a data do formulário
      end = new Date(`${bookingDate} ${endTime}`)
    } else {
      end = new Date(endTime || new Date())
    }
    
    const durationMs = end.getTime() - start.getTime()
    const durationHours = durationMs / (1000 * 60 * 60) // Converter para horas
    
    console.log('🔍 Debug - Cálculo de preço:', {
      startTime,
      endTime,
      hourlyRate,
      start: start.toISOString(),
      end: end.toISOString(),
      durationMs,
      durationHours
    })
    
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
      
      console.log('🔍 Recalculando preço com novos horários:', {
        startTime: allValues.startTime,
        endTime: allValues.endTime,
        courtPrice: selectedCourt.price
      })
      
      const price = calculateTotalPrice(allValues.startTime, allValues.endTime, selectedCourt.price)
      console.log('💰 Preço calculado:', price, 'para quadra:', selectedCourt.name, 'taxa horária:', selectedCourt.price)
      
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
      
      // Formatar data e horário para validação
      const bookingDate = values.bookingDate ? values.bookingDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0]
      const startTime = values.startTime || '00:00'
      
      // VALIDAÇÃO CRÍTICA: Verificar se o horário ainda está disponível
      console.log('🔍 Verificando disponibilidade antes da reserva:', {
        courtId: selectedCourt.id,
        date: bookingDate,
        time: startTime
      })
      
      const isAvailable = await availabilityService.isTimeSlotAvailable(
        selectedCourt.id, 
        bookingDate, 
        startTime
      )
      
      if (!isAvailable) {
        notification.error({
          message: 'Horário não disponível',
          description: 'Este horário foi ocupado por outro jogador ou bloqueado pelo dono. Tente outro horário.',
          placement: 'topRight'
        })
        return
      }
      
      console.log('✅ Horário de início confirmado como disponível!')
      
      const endTime = values.endTime ? values.endTime.format('HH:mm') : '00:00'
      
      // Verificar se o horário de fim também não conflita (para reservas de múltiplas horas)
      if (startTime !== endTime) {
        const endTimeAvailable = await availabilityService.isTimeSlotAvailable(
          selectedCourt.id, 
          bookingDate, 
          endTime
        )
        
        if (!endTimeAvailable) {
          notification.error({
            message: 'Horário de fim não disponível',
            description: 'O horário de fim selecionado foi ocupado. Tente ajustar a duração da reserva.',
            placement: 'topRight'
          })
          return
        }
        
        console.log('✅ Horário de fim também confirmado como disponível!')
        
        // Verificar horários intermediários para reservas de múltiplas horas
        const startHour = parseInt(startTime.split(':')[0])
        const endHour = parseInt(endTime.split(':')[0])
        
        if (endHour > startHour + 1) {
          console.log('🔍 Verificando horários intermediários...')
          
          for (let hour = startHour + 1; hour < endHour; hour++) {
            const intermediateTime = `${hour.toString().padStart(2, '0')}:00`
            const intermediateAvailable = await availabilityService.isTimeSlotAvailable(
              selectedCourt.id, 
              bookingDate, 
              intermediateTime
            )
            
            if (!intermediateAvailable) {
              notification.error({
                message: 'Conflito em horário intermediário',
                description: `O horário ${intermediateTime} foi ocupado. Tente ajustar a duração da reserva.`,
                placement: 'topRight'
              })
              return
            }
          }
          
          console.log('✅ Todos os horários intermediários confirmados como disponíveis!')
        }
      }
      
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
        date: bookingDate,
        time: startTime,
        endTime: endTime,
        totalPrice: calculatedTotalPrice,
        price: selectedCourt.price,
        duration: startTime && endTime ? Math.round((new Date(`${bookingDate} ${endTime}`).getTime() - new Date(`${bookingDate} ${startTime}`).getTime()) / (1000 * 60 * 60) * 100) / 100 : 0,
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
      // VALIDAÇÃO FINAL: Verificar se o horário ainda está disponível no momento do pagamento
      console.log('🔍 Validação final de disponibilidade antes do pagamento:', {
        courtId: selectedBooking.courtId,
        date: selectedBooking.date,
        time: selectedBooking.time
      })
      
      const isStillAvailable = await availabilityService.isTimeSlotAvailable(
        selectedBooking.courtId, 
        selectedBooking.date, 
        selectedBooking.time
      )
      
      if (!isStillAvailable) {
        notification.error({
          message: 'Horário não disponível',
          description: 'Este horário foi ocupado enquanto você estava fazendo o pagamento. Tente outro horário.',
          placement: 'topRight'
        })
        setPaymentModalOpen(false)
        setSelectedBooking(null)
        return
      }
      
      console.log('✅ Horário ainda disponível no momento do pagamento!')
      
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

      // Salvar reserva no Firebase com status 'confirmed' (auto-confirmação)
      const confirmedBookingData = {
        ...bookingData,
        status: 'confirmed', // Auto-confirmação após pagamento
        paymentStatus: 'paid',
        paymentDate: new Date().toISOString(),
        confirmedAt: new Date().toISOString()
      }
      
      await bookingsService.createBooking(confirmedBookingData)

      notification.success({
        message: 'Reserva confirmada automaticamente!',
        description: `Quadra ${selectedBooking.courtName} reservada e confirmada após pagamento`,
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
              color: '#B1EC32',
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
          {/* Barra de Busca Centralizada */}
          <Card style={{ 
            marginBottom: isMobile ? '20px' : '32px', 
            background: 'linear-gradient(135deg, #B1EC32 0%, #8BC34A 100%)',
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 8px 25px -5px rgba(177, 236, 50, 0.3), 0 4px 6px -2px rgba(177, 236, 50, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: isMobile ? '20px' : '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Title level={isMobile ? 3 : 2} style={{ 
                  margin: 0, 
                  color: 'white', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  🔍 Encontre sua quadra ideal
                </Title>
                <Text style={{ 
                  fontSize: isMobile ? '14px' : '16px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  display: 'block'
                }}>
                  Busque por esporte, localização e data
                </Text>
              </div>
              
              {/* Filtros de busca */}
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="🏐 Esporte"
                    style={{ width: '100%' }}
                    size="large"
                    value={searchFilters.sport}
                    onChange={(value) => setSearchFilters(prev => ({ ...prev, sport: value }))}
                    allowClear
                  >
                    {sports.map(sport => (
                      <Option key={sport.id} value={sport.name}>
                        {sport.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder="📍 Localização"
                    size="large"
                    style={{ width: '100%' }}
                    value={searchFilters.location}
                    onChange={(value) => setSearchFilters(prev => ({ ...prev, location: value }))}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="">Todas as localizações</Option>
                    <Option value="São Paulo">São Paulo</Option>
                    <Option value="Rio de Janeiro">Rio de Janeiro</Option>
                    <Option value="Minas Gerais">Minas Gerais</Option>
                    <Option value="Bahia">Bahia</Option>
                    <Option value="Paraná">Paraná</Option>
                    <Option value="Rio Grande do Sul">Rio Grande do Sul</Option>
                    <Option value="Pernambuco">Pernambuco</Option>
                    <Option value="Ceará">Ceará</Option>
                    <Option value="Pará">Pará</Option>
                    <Option value="Santa Catarina">Santa Catarina</Option>
                    <Option value="Goiás">Goiás</Option>
                    <Option value="Maranhão">Maranhão</Option>
                    <Option value="Paraíba">Paraíba</Option>
                    <Option value="Espírito Santo">Espírito Santo</Option>
                    <Option value="Piauí">Piauí</Option>
                    <Option value="Alagoas">Alagoas</Option>
                    <Option value="Tocantins">Tocantins</Option>
                    <Option value="Rio Grande do Norte">Rio Grande do Norte</Option>
                    <Option value="Acre">Acre</Option>
                    <Option value="Amapá">Amapá</Option>
                    <Option value="Amazonas">Amazonas</Option>
                    <Option value="Mato Grosso">Mato Grosso</Option>
                    <Option value="Mato Grosso do Sul">Mato Grosso do Sul</Option>
                    <Option value="Rondônia">Rondônia</Option>
                    <Option value="Roraima">Roraima</Option>
                    <Option value="Sergipe">Sergipe</Option>
                    <Option value="Distrito Federal">Distrito Federal</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8}>
                  <DatePicker
                    placeholder="📅 Data"
                    size="large"
                    style={{ width: '100%' }}
                    value={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date)
                      if (date) {
                        const dateString = date.format('YYYY-MM-DD')
                        setSearchFilters(prev => ({ ...prev, date: dateString }))
                      }
                    }}
                  />
                </Col>
              </Row>
              
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={searchCourts}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    fontWeight: '600',
                    height: '48px',
                    paddingLeft: '24px',
                    paddingRight: '24px'
                  }}
                >
                  Buscar Quadras
                </Button>
              </div>
            </div>
          </Card>


          {/* Indicador de Quadra Favorita Selecionada */}
          {selectedFavoriteCourt && (
            <Card style={{ 
              marginBottom: '24px', 
              background: 'linear-gradient(135deg, #B1EC32 0%, #B1EC32 100%)',
              border: '2px solid #B1EC32'
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

          {/* Lista de Estabelecimentos com Disponibilidade */}
          {courtsWithAvailability && courtsWithAvailability.length > 0 && (
            <Card title="🏟️ Quadras Disponíveis" style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                <Text strong style={{ color: '#52c41a' }}>
                  🎯 Mostrando apenas quadras com horários disponíveis para {selectedDate ? selectedDate.format('DD/MM/YYYY') : 'hoje'}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Horários bloqueados ou ocupados não aparecem para jogadores
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  🔄 Dados atualizados automaticamente - você não precisa clicar em "Atualizar"!
                </Text>
              </div>
              <Row gutter={[16, 16]}>
                {courtsWithAvailability && courtsWithAvailability.map(court => (
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
                          <TeamOutlined /> {(court.sports || [court.sport]).join(', ') || 'Não informado'}
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
                        <br />
                        <Text strong>Horários Livres:</Text> 
                        <Tag color="blue" style={{ marginLeft: '8px' }}>
                          {court.totalAvailableSlots} horários
                        </Tag>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Próximos horários: {court.availableSlots?.slice(0, 3).map(slot => slot.time).join(', ')}
                        </Text>
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
                        <Tag color={booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'green' : 'red'}>
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
                    <Tag color={status === 'confirmed' ? 'green' : status === 'pending' ? 'green' : 'red'}>
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
                          color: '#B1EC32',
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
              name="bookingDate"
              label="📅 Data da Reserva"
              rules={[{ required: true, message: 'Selecione a data!' }]}
              help="Escolha a data para ver os horários disponíveis"
            >
              <DatePicker 
                placeholder="Selecione a data"
                style={{ width: '100%' }}
                size="large"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                onChange={(date) => {
                  if (date && selectedCourt) {
                    // Recarregar horários quando a data mudar
                    loadTimeSlotsForDate(selectedCourt.id, date)
                  }
                }}
              />
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

            {loadingTimeSlots ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <Spin size="large" />
                <br />
                <Text style={{ marginTop: '8px', display: 'block' }}>
                  🔍 Carregando horários disponíveis...
                </Text>
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                background: '#fff2e8',
                border: '1px solid #ffb366',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <Text type="warning" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  ⚠️ Nenhum horário disponível
                </Text>
                <br />
                <Text type="secondary">
                  Não há horários livres para esta quadra na data selecionada. 
                  Tente outra data ou escolha uma quadra diferente.
                </Text>
              </div>
            ) : (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="startTime"
                    label="🕐 Horário de Início"
                    rules={[{ required: true, message: 'Selecione o horário de início!' }]}
                    help={`${availableTimeSlots.length} horários disponíveis`}
                  >
                    <Select 
                      placeholder="Selecione o horário de início"
                      style={{ width: '100%' }}
                      size="large"
                    >
                      {availableTimeSlots.map(slot => (
                        <Select.Option key={slot.time} value={slot.time}>
                          🕐 {slot.time} - Disponível
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="endTime"
                    label="🕐 Horário de Fim"
                    rules={[{ required: true, message: 'Selecione o horário de fim!' }]}
                    help="Selecione quando deseja terminar"
                  >
                    <Select 
                      placeholder="Selecione o horário de fim"
                      style={{ width: '100%' }}
                      size="large"
                    >
                      {availableTimeSlots.map(slot => (
                        <Select.Option key={slot.time} value={slot.time}>
                          🕐 {slot.time} - Disponível
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

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
                  disabled={calculatedPrice <= 0 || availableTimeSlots.length === 0}
                >
                  {availableTimeSlots.length === 0 ? 'Nenhum horário disponível' : `Ir para Pagamento (R$ ${calculatedPrice.toFixed(2)})`}
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
              <Title level={4} style={{ margin: '12px 0 0 0', color: '#B1EC32' }}>
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