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
import { mockGetSports, mockGetCourts, mockGetUserBookings, mockGetFavoriteCourts, mockAddFavoriteCourt, mockRemoveFavoriteCourt, mockGetMatchHistory, mockCreateBookingWithPayment, mockCancelBooking } from '../utils/mockApi'
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
   * Carrega dados iniciais
   */
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [sportsData, bookingsData, favoritesData, historyData] = await Promise.all([
        mockGetSports(),
        mockGetUserBookings(user?.id),
        mockGetFavoriteCourts(user?.id),
        mockGetMatchHistory(user?.id)
      ])
      setSports(sportsData)
      setBookings(bookingsData)
      setFavoriteCourts(favoritesData)
      setMatchHistory(historyData)
    } catch (error) {
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Busca quadras/estabelecimentos com filtros
   */
  const searchCourts = async () => {
    setLoading(true)
    try {
      const courtsData = await mockGetCourts(searchFilters.sport, searchFilters.location)
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
  }

  /**
   * Calcula o preço total baseado na duração e preço por hora
   */
  const calculateTotalPrice = (startTime, endTime, hourlyRate) => {
    if (!startTime || !endTime || !hourlyRate) return 0
    
    const start = new Date(startTime)
    const end = new Date(endTime)
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
    
    // Se mudou horários ou quadra, recalcula o preço
    if ((changedValues.startTime || changedValues.endTime || changedValues.courtId) && 
        allValues.startTime && allValues.endTime && allValues.courtId && selectedCourt) {
      
      const selectedCourtData = selectedCourt.courts.find(c => c.id === allValues.courtId)
      if (selectedCourtData) {
        const price = calculateTotalPrice(allValues.startTime, allValues.endTime, selectedCourtData.hourlyRate)
        console.log('Calculated price:', price, 'for court:', selectedCourtData.name, 'hourly rate:', selectedCourtData.hourlyRate)
        setCalculatedPrice(price)
        form.setFieldsValue({ totalPrice: price })
      }
    }
  }

  /**
   * Cria nova reserva
   */
  const handleCreateBooking = async (values) => {
    try {
      const selectedCourtData = selectedCourt.courts.find(c => c.id === values.courtId)
      const calculatedTotalPrice = calculateTotalPrice(values.startTime, values.endTime, selectedCourtData.hourlyRate)
      
      // Valida se o preço foi calculado corretamente
      if (calculatedTotalPrice <= 0) {
        notification.error({
          message: 'Erro no cálculo do preço',
          description: 'Verifique os horários selecionados',
          placement: 'topRight'
        })
        return
      }
      
      const bookingData = {
        courtId: values.courtId,
        courtName: selectedCourtData.name,
        establishmentName: selectedCourt.name,
        userId: user.id,
        userName: user.name,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        totalPrice: calculatedTotalPrice,
        hourlyRate: selectedCourtData.hourlyRate,
        duration: Math.round((new Date(values.endTime).getTime() - new Date(values.startTime).getTime()) / (1000 * 60 * 60) * 100) / 100,
        sport: values.sport
      }

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
      const result = await mockCreateBookingWithPayment(selectedBooking, {
        amount: selectedBooking.totalPrice,
        cardNumber: '1234567890123456', // Simulado
        email: user.email
      })

      if (result.success) {
        notification.success({
          message: 'Reserva confirmada com sucesso!',
          description: `Quadra ${selectedBooking.courtName} reservada e paga`,
          placement: 'topRight'
        })
        setPaymentModalOpen(false)
        setSelectedBooking(null)
        loadInitialData()
      } else {
        notification.error({
          message: 'Erro ao confirmar reserva',
          description: result.error || 'Tente novamente',
          placement: 'topRight'
        })
      }
    } catch (error) {
      notification.error({
        message: 'Erro ao processar pagamento',
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
      const result = await mockCancelBooking(bookingId, 'Cancelado pelo usuário')
      if (result.success) {
        notification.success({
          message: 'Reserva cancelada!',
          description: 'Sua reserva foi cancelada com sucesso',
          placement: 'topRight'
        })
        loadInitialData()
      } else {
        notification.error({
          message: 'Erro ao cancelar reserva',
          description: result.error || 'Tente novamente',
          placement: 'topRight'
        })
      }
    } catch (error) {
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
        userId: user.id,
        courtId: court.id,
        courtName: court.name,
        establishmentName: court.name,
        establishmentId: court.id
      }

      const result = await mockAddFavoriteCourt(favoriteData)
      if (result.success) {
        notification.success({
          message: 'Quadra adicionada aos favoritos!',
          description: `${court.name} foi adicionada aos seus favoritos`,
          placement: 'topRight'
        })
        loadInitialData()
      }
    } catch (error) {
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
      const result = await mockRemoveFavoriteCourt(favoriteId)
      if (result.success) {
        notification.success({
          message: 'Quadra removida dos favoritos!',
          description: 'A quadra foi removida da sua lista de favoritos',
          placement: 'topRight'
        })
        loadInitialData()
      }
    } catch (error) {
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
    return favoriteCourts.some(fav => fav.courtId === courtId)
  }

  /**
   * Redireciona para reserva a partir dos favoritos
   */
  const handleReserveFromFavorites = async (favorite) => {
    try {
      // Recarrega todas as quadras disponíveis
      const courtsData = await mockGetCourts()
      setCourts(courtsData)
      
      // Define a quadra favorita como selecionada
      setSelectedFavoriteCourt(favorite)
      
      // Filtra as quadras para mostrar apenas a quadra favorita
      setSearchFilters({
        sport: null,
        location: '',
        date: null
      })
      
      // Scroll para a seção de busca
      setTimeout(() => {
        const searchSection = document.getElementById('search-section')
        if (searchSection) {
          searchSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      
      notification.success({
        message: 'Quadra selecionada!',
        description: `Agora você pode reservar ${favorite.courtName}. Use os filtros para encontrar horários disponíveis.`,
        placement: 'topRight',
        duration: 4
      })
    } catch (error) {
      notification.error({
        message: 'Erro ao carregar quadras',
        description: 'Não foi possível carregar as quadras disponíveis',
        placement: 'topRight'
      })
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header style={{ 
        background: '#fff', 
        padding: isMobile ? '0 16px' : '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: isMobile ? '60px' : '64px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              style={{ marginRight: '12px' }}
            />
          )}
          <Logo size={isMobile ? "small" : "medium"} style={{ marginRight: isMobile ? '12px' : '16px' }} />
          {!isMobile && (
            <div>
              <Title level={4} style={{ margin: 0, color: '#ff5e0e' }}>
                Dashboard do Jogador
              </Title>
              <Text type="secondary">
                Olá, {user?.name || user?.email}!
              </Text>
            </div>
          )}
        </div>
        
        <Button 
          type="primary" 
          danger 
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          size={isMobile ? "small" : "middle"}
        >
          Sair
        </Button>
      </Header>

      {/* Conteúdo Principal */}
      <Content style={{ 
        padding: isMobile ? '16px' : isTablet ? '20px' : '24px', 
        background: '#f5f5f5' 
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          padding: isMobile ? '0' : '0 16px'
        }}>
          {/* Boas-vindas */}
          <Card style={{ 
            marginBottom: isMobile ? '16px' : '24px', 
            background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%)' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: isMobile ? 'flex-start' : 'center', 
              marginBottom: '16px',
              flexDirection: isMobile ? 'column' : 'row',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {isMobile && (
                <div style={{ marginBottom: '12px' }}>
                  <Title level={3} style={{ margin: 0, color: '#ff5e0e' }}>
                    Olá, {user?.name || 'Jogador'}! 👋
                  </Title>
                </div>
              )}
              <Logo size={isMobile ? "medium" : "large"} style={{ 
                marginRight: isMobile ? '0' : '16px',
                marginBottom: isMobile ? '12px' : '0'
              }} />
              <div>
                <Title level={isMobile ? 3 : 2} style={{ margin: 0, color: '#ff5e0e' }}>
                  Encontre seu esporte! 🏆
                </Title>
                <Text style={{ 
                  fontSize: isMobile ? '14px' : '16px',
                  display: isMobile ? 'block' : 'inline'
                }}>
                  Busque estabelecimentos, reserve quadras e conecte-se com outros jogadores.
                </Text>
              </div>
            </div>
          </Card>

          {/* BARRA DE PESQUISA GRANDE E CLARA */}
          <Card id="search-section" style={{ 
            marginBottom: isMobile ? '16px' : '24px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}>
            <Row gutter={isMobile ? [8, 8] : [16, 16]} align="middle">
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
                      height: isMobile ? '40px' : '48px'
                    }}
                    size={isMobile ? "middle" : "large"}
                    value={searchFilters.sport}
                    onChange={(value) => setSearchFilters({...searchFilters, sport: value})}
                  >
                    {sports.map(sport => (
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
                  <Input
                    placeholder="Digite a localização"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                    prefix={<EnvironmentOutlined />}
                    style={{ 
                      height: '48px', 
                      fontSize: '16px'
                    }}
                    size="large"
                  />
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
                      height: '48px'
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
                        height: '48px', 
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: 'bold'
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
            {favoriteCourts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {favoriteCourts.map(favorite => (
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
                          Adicionado em: {new Date(favorite.addedDate).toLocaleDateString('pt-BR')}
                        </Text>
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
          {courts.length > 0 && (
            <Card title="Estabelecimentos Encontrados" style={{ marginBottom: '24px' }}>
              <Row gutter={[16, 16]}>
                {courts.map(court => (
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
                            handleRemoveFromFavorites(favoriteCourts.find(fav => fav.courtId === court.id)?.id) : 
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
                          <TeamOutlined /> {court.sports.join(', ')}
                        </Text>
                        <br />
                        <Text type="secondary">
                          ⭐ {court.rating}/5.0
                        </Text>
                        <Divider style={{ margin: '12px 0' }} />
                        <Text strong>Quadras disponíveis:</Text>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          {court.courts.map(courtItem => (
                            <li key={courtItem.id}>
                              <Text>
                                {courtItem.name} - R$ {courtItem.hourlyRate}/hora
                                {courtItem.isAvailable ? (
                                  <Tag color="green" style={{ marginLeft: '8px' }}>Disponível</Tag>
                                ) : (
                                  <Tag color="red" style={{ marginLeft: '8px' }}>Ocupada</Tag>
                                )}
                              </Text>
                            </li>
                          ))}
                        </ul>
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
                {bookings.map(booking => (
                  <Card 
                    key={booking.id} 
                    size="small" 
                    style={{ marginBottom: '12px' }}
                    title={booking.courtName}
                  >
                    <div style={{ fontSize: '14px' }}>
                      <div><strong>🏢</strong> {booking.establishmentName}</div>
                      <div><strong>📅</strong> {new Date(booking.date).toLocaleDateString('pt-BR')}</div>
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
                      <Text>{new Date(record.startTime).toLocaleDateString('pt-BR')}</Text>
                      <br />
                      <Text type="secondary">
                        <ClockCircleOutlined /> {new Date(record.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(record.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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

          {/* Histórico de Partidas */}
          <Card title="🏆 Histórico de Partidas">
            {matchHistory.length > 0 ? (
              isMobile ? (
                // Layout mobile com cards
                <div>
                  {matchHistory.map(match => (
                    <Card 
                      key={match.id} 
                      size="small" 
                      style={{ marginBottom: '12px' }}
                      title={`${match.sport} - ${new Date(match.date).toLocaleDateString('pt-BR')}`}
                    >
                      <div style={{ fontSize: '14px' }}>
                        <div><strong>🏟️</strong> {match.courtName}</div>
                        <div><strong>🏢</strong> {match.establishmentName}</div>
                        <div><strong>⏰</strong> {match.time}</div>
                        <div><strong>👥</strong> {match.players?.length || 0} jogadores</div>
                        <div><strong>🏆</strong> {match.result || 'Partida realizada'}</div>
                        <div style={{ marginTop: '8px' }}>
                          <Tag color="blue">{match.sport}</Tag>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                // Layout desktop com tabela
                <Table
                  dataSource={matchHistory}
                  columns={[
                    {
                      title: 'Data',
                      dataIndex: 'date',
                      key: 'date',
                      render: (date) => new Date(date).toLocaleDateString('pt-BR')
                    },
                  {
                    title: 'Quadra',
                    dataIndex: 'courtName',
                    key: 'courtName',
                  },
                  {
                    title: 'Esporte',
                    dataIndex: 'sport',
                    key: 'sport',
                    render: (sport) => <Tag color="blue">{sport}</Tag>
                  },
                  {
                    title: 'Horário',
                    key: 'time',
                    render: (_, record) => (
                      <Text>{record.startTime} - {record.endTime}</Text>
                    )
                  },
                  {
                    title: 'Resultado',
                    dataIndex: 'result',
                    key: 'result',
                    render: (result) => (
                      <Tag color={result === 'Vitória' ? 'green' : 'red'}>
                        {result}
                      </Tag>
                    )
                  },
                  {
                    title: 'Placar',
                    dataIndex: 'score',
                    key: 'score',
                    render: (score) => <Text strong>{score}</Text>
                  },
                  {
                    title: 'Jogadores',
                    dataIndex: 'players',
                    key: 'players',
                    render: (players) => (
                      <div>
                        {players.slice(0, 2).map((player, index) => (
                          <Text key={index} style={{ display: 'block', fontSize: '12px' }}>
                            {player}
                          </Text>
                        ))}
                        {players.length > 2 && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            +{players.length - 2} outros
                          </Text>
                        )}
                      </div>
                    )
                  },
                  {
                    title: 'Valor',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => <Text strong>R$ {price}</Text>
                  }
                ]}
                pagination={{ pageSize: 5 }}
                size="middle"
              />
              )
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
                {selectedCourt?.courts.filter(court => court.isAvailable).map(court => (
                  <Select.Option key={court.id} value={court.id}>
                    {court.name} - R$ {court.hourlyRate}/hora
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="sport"
              label="Esporte"
              rules={[{ required: true, message: 'Selecione o esporte!' }]}
            >
              <Select placeholder="Selecione o esporte">
                {sports.map(sport => (
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
                  💡 <strong>Cálculo Automático:</strong> R$ {selectedCourt?.courts.find(c => c.id === form.getFieldValue('courtId'))?.hourlyRate || 0} por hora × {calculatedPrice > 0 ? (calculatedPrice / (selectedCourt?.courts.find(c => c.id === form.getFieldValue('courtId'))?.hourlyRate || 1)).toFixed(1) : 0} horas = R$ {calculatedPrice.toFixed(2)}
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