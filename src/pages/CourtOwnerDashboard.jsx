import React, { useState, useEffect } from 'react'
import {
  Layout,
  Typography,
  Button,
  Space,
  Card,
  Row,
  Col,
  Avatar,
  Divider,
  Statistic,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Badge,
  notification,
  Tooltip,
  Progress,
  Empty,
  Skeleton,
  Tabs,
  DatePicker,
  TimePicker
} from 'antd'
import { 
  ShopOutlined, 
  LogoutOutlined, 
  TeamOutlined, 
  TrophyOutlined, 
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  BlockOutlined,
  UnlockOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { courtsService, sportsService, bookingsService, statsService, scheduleService } from '../services/firestoreService'
import Logo from '../components/Logo'
import useResponsive from '../hooks/useResponsive'
import { vestiarioGradients, vestiarioStyles } from '../theme/vestiarioTheme'

const { Header, Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

/**
 * Dashboard para donos de quadras/estabelecimentos
 * Permite gerenciar quadras, visualizar reservas e estatísticas
 */
const CourtOwnerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [bookings, setBookings] = useState([])
  const [sports, setSports] = useState([])
  const [scheduleData, setScheduleData] = useState([])
  const [ownerStats, setOwnerStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [courtModalOpen, setCourtModalOpen] = useState(false)
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [establishmentModalOpen, setEstablishmentModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('agenda')
  const [editingCourt, setEditingCourt] = useState(null)
  const [userEstablishment, setUserEstablishment] = useState(null)
  const [userEstablishments, setUserEstablishments] = useState([])
  const [form] = Form.useForm()
  const [blockForm] = Form.useForm()
  const [settingsForm] = Form.useForm()
  const [courtForm] = Form.useForm()
  const [establishmentForm] = Form.useForm()

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
      console.log('🔄 Carregando dados para dono:', user.uid)
      const [sportsData, bookingsData, scheduleData, statsData, courtsData] = await Promise.all([
        sportsService.getAllSports(),
        bookingsService.getOwnerBookings(user.uid),
        scheduleService.getScheduleData(selectedDate),
        statsService.getOwnerStats(user.uid),
        courtsService.getCourtsByOwner(user.uid)
      ])
      
      console.log('📊 Dados carregados:', {
        sports: sportsData.length,
        bookings: bookingsData.length,
        schedule: scheduleData.length,
        courts: courtsData.length,
        stats: statsData
      })
      
      setSports(sportsData)
      setBookings(bookingsData)
      setScheduleData(scheduleData)
      setOwnerStats(statsData)
      
      // Carrega o estabelecimento do usuário com todas as quadras
      if (courtsData.length > 0) {
        // Calcular estatísticas do estabelecimento
        const allSports = [...new Set(courtsData.map(court => court.sport))]
        const averageRating = courtsData.reduce((sum, court) => sum + (court.rating || 0), 0) / courtsData.length
        const totalCourts = courtsData.length
        
        // Usar dados da primeira quadra como base do estabelecimento
        const firstCourt = courtsData[0]
        
        // Criar nome do estabelecimento baseado no nome do usuário ou primeira quadra
        const establishmentName = user?.displayName 
          ? `Estabelecimento ${user.displayName}`
          : firstCourt.establishmentName || 'Meu Estabelecimento'
        
        setUserEstablishment({
          id: user?.uid, // ID do usuário como ID do estabelecimento
          name: establishmentName,
          location: firstCourt.location || 'Local não informado',
          address: firstCourt.address || 'Endereço não informado',
          phone: firstCourt.phone || '(11) 99999-9999',
          email: firstCourt.email || user?.email,
          rating: Math.round(averageRating * 10) / 10, // Rating médio
          sports: allSports, // Todos os esportes únicos
          courts: courtsData, // Todas as quadras
          totalCourts: totalCourts,
          ownerName: user?.displayName || 'Proprietário'
        })
      } else {
        // Se não há quadras, criar um estabelecimento vazio
        setUserEstablishment({
          id: user?.uid,
          name: 'Meu Estabelecimento',
          location: 'Local não informado',
          address: 'Endereço não informado',
          phone: '(11) 99999-9999',
          email: user?.email,
          rating: 0,
          sports: [],
          courts: [],
          totalCourts: 0,
          ownerName: user?.displayName || 'Proprietário'
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega dados da agenda quando a data muda
   */
  useEffect(() => {
    if (selectedDate) {
      loadScheduleData()
    }
  }, [selectedDate])

  const loadScheduleData = async () => {
    try {
      const data = await scheduleService.getScheduleData(selectedDate)
      setScheduleData(data)
    } catch (error) {
      console.error('Erro ao carregar agenda:', error)
      message.error('Erro ao carregar agenda')
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
   * Adiciona nova quadra
   */
  const handleAddCourt = async (values) => {
    try {
      const newCourt = {
        name: values.name,
        sport: values.sport,
        location: userEstablishment?.location || 'Local não informado',
        address: userEstablishment?.address || 'Endereço não informado',
        price: values.hourlyRate || 80.00,
        description: values.description || 'Quadra de esporte',
        amenities: values.amenities || ['Vestiário', 'Estacionamento'],
        ownerId: user?.uid,
        ownerName: user?.displayName || 'Proprietário',
        phone: userEstablishment?.phone || '(11) 99999-9999',
        email: user?.email,
        images: ['https://via.placeholder.com/400x300?text=' + encodeURIComponent(values.name)],
        rating: 0,
        totalReviews: 0,
        isAvailable: true
      }

      await courtsService.createCourt(newCourt)
      
      message.success('Quadra adicionada com sucesso!')
      setCourtModalOpen(false)
      courtForm.resetFields()
      setEditingCourt(null)
      
      // Recarregar dados
      loadInitialData()
    } catch (error) {
      console.error('Erro ao adicionar quadra:', error)
      message.error('Erro ao adicionar quadra')
    }
  }

  /**
   * Edita quadra existente
   */
  const handleEditCourt = async (values) => {
    try {
      if (!editingCourt) {
        message.error('Quadra não encontrada')
        return
      }

      const updatedCourtData = {
        name: values.name,
        sport: values.sport,
        price: values.hourlyRate || editingCourt.price,
        description: values.description || editingCourt.description,
        amenities: values.amenities || editingCourt.amenities
      }

      await courtsService.updateCourt(editingCourt.id, updatedCourtData)
      
      message.success('Quadra editada com sucesso!')
      setCourtModalOpen(false)
      courtForm.resetFields()
      setEditingCourt(null)
      
      // Recarregar dados
      loadInitialData()
    } catch (error) {
      console.error('Erro ao editar quadra:', error)
      message.error('Erro ao editar quadra')
    }
  }

  /**
   * Exclui quadra
   */
  const handleDeleteCourt = async (courtId) => {
    try {
      await courtsService.deleteCourt(courtId)
      
      message.success('Quadra excluída com sucesso!')
      
      // Recarregar dados para atualizar agenda e lista
      loadInitialData()
    } catch (error) {
      console.error('Erro ao excluir quadra:', error)
      message.error('Erro ao excluir quadra')
    }
  }

  /**
   * Abre modal para editar quadra
   */
  const openEditCourtModal = (court) => {
    setEditingCourt(court)
    courtForm.setFieldsValue({
      name: court.name,
      sport: court.sport,
      hourlyRate: court.price,
      isIndoor: court.isIndoor
    })
    setCourtModalOpen(true)
  }

  /**
   * Abre modal para adicionar quadra
   */
  const openAddCourtModal = () => {
    setEditingCourt(null)
    courtForm.resetFields()
    setCourtModalOpen(true)
  }

  /**
   * Abre modal para bloquear horário
   */
  const openBlockModal = (courtId, timeSlot) => {
    setSelectedCourt({ courtId, timeSlot })
    setBlockModalOpen(true)
    blockForm.resetFields()
  }

  /**
   * Bloqueia horário
   */
  const handleBlockTimeSlot = async (values) => {
    try {
      if (!selectedCourt) {
        notification.error({
          message: 'Erro',
          description: 'Dados do horário não encontrados',
          placement: 'topRight'
        })
        return
      }

      await scheduleService.blockTimeSlot(
        selectedCourt.courtId,
        selectedDate,
        selectedCourt.timeSlot,
        values.reason
      )
      
      notification.success({
        message: 'Horário bloqueado!',
        description: 'O horário foi bloqueado com sucesso',
        placement: 'topRight'
      })
      setBlockModalOpen(false)
      blockForm.resetFields()
      setSelectedCourt(null)
      
      // Recarrega os dados da agenda
      await loadScheduleData()
    } catch (error) {
      console.error('Erro ao bloquear horário:', error)
      notification.error({
        message: 'Erro ao bloquear horário',
        description: 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Confirma reserva
   */
  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingsService.confirmBooking(bookingId)
      notification.success({
        message: 'Reserva confirmada!',
        description: 'A reserva foi confirmada com sucesso',
        placement: 'topRight'
      })
      loadInitialData()
    } catch (error) {
      console.error('Erro ao confirmar reserva:', error)
      notification.error({
        message: 'Erro ao confirmar reserva',
        description: 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Cancela reserva
   */
  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingsService.cancelBooking(bookingId)
      notification.success({
        message: 'Reserva cancelada!',
        description: 'A reserva foi cancelada com sucesso',
        placement: 'topRight'
      })
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
   * Abre modal de configurações
   */
  const openSettings = () => {
    setSettingsModalOpen(true)
  }

  /**
   * Salva configurações
   */
  const handleSaveSettings = async (values) => {
    try {
      // Simula salvamento de configurações
      notification.success({
        message: 'Configurações salvas!',
        description: 'As configurações do estabelecimento foram atualizadas',
        placement: 'topRight'
      })
      setSettingsModalOpen(false)
      settingsForm.resetFields()
    } catch (error) {
      notification.error({
        message: 'Erro ao salvar configurações',
        description: 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Salva informações do estabelecimento
   */
  const handleSaveEstablishment = async (values) => {
    try {
      // Atualizar o estabelecimento localmente
      const updatedEstablishment = {
        ...userEstablishment,
        name: values.name,
        address: values.address,
        phone: values.phone,
        email: values.email
      }
      
      setUserEstablishment(updatedEstablishment)
      
      // TODO: Implementar salvamento no Firebase
      // await establishmentsService.updateEstablishment(userEstablishment.id, values)
      
      message.success('Estabelecimento atualizado com sucesso!')
      setEstablishmentModalOpen(false)
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error)
      message.error('Erro ao salvar estabelecimento')
    }
  }

  /**
   * Cores para cada quadra
   */
  const getCourtColor = (courtId) => {
    const colors = {
      1: '#1890ff', // Azul para Quadra 1
      2: '#52c41a', // Verde para Quadra 2
      3: '#faad14', // Laranja para Quadra 3
      4: '#f5222d', // Vermelho para Quadra 4
      5: '#722ed1', // Roxo para Quadra 5
    }
    return colors[courtId] || '#8c8c8c'
  }

  /**
   * Renderiza status do horário
   */
  const renderTimeSlot = (timeSlot, courtId) => {
    const baseStyle = {
      padding: '8px',
      margin: '2px',
      borderRadius: '4px',
      textAlign: 'center',
      cursor: timeSlot.status === 'available' ? 'pointer' : 'default',
      border: `2px solid ${getCourtColor(courtId)}`,
      minHeight: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }

    switch (timeSlot.status) {
      case 'available':
        return (
          <div
            style={{
              ...baseStyle,
              backgroundColor: '#f6ffed',
              color: getCourtColor(courtId)
            }}
            onClick={() => openBlockModal(courtId, timeSlot.time)}
            title="Clique para bloquear"
          >
            <Text strong>{timeSlot.time}</Text>
            <Text type="secondary" style={{ fontSize: '10px' }}>Disponível</Text>
          </div>
        )
      case 'booked':
        return (
          <div
            style={{
              ...baseStyle,
              backgroundColor: '#e6f7ff',
              color: '#1890ff'
            }}
            title={`Reservado por: ${timeSlot.clientName}`}
          >
            <Text strong>{timeSlot.time}</Text>
            <Text type="secondary" style={{ fontSize: '10px' }}>{timeSlot.clientName}</Text>
          </div>
        )
      case 'blocked':
        return (
          <div
            style={{
              ...baseStyle,
              backgroundColor: '#fff2e8',
              color: '#fa8c16'
            }}
            title={`Bloqueado: ${timeSlot.reason}`}
          >
            <Text strong>{timeSlot.time}</Text>
            <Text type="secondary" style={{ fontSize: '10px' }}>{timeSlot.reason}</Text>
          </div>
        )
      default:
        return null
    }
  }

  // userEstablishment agora é um estado gerenciado

  const columns = [
    {
      title: 'Quadra',
      dataIndex: 'courtName',
      key: 'courtName',
    },
    {
      title: 'Cliente',
      dataIndex: 'userName',
      key: 'userName',
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
          <Text>{record.date ? record.date.split('-').reverse().join('/') : 'Data não informada'}</Text>
          <br />
          <Text type="secondary">
            {record.time || 'Horário não informado'}
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
              type="primary"
              onClick={() => handleConfirmBooking(record.id)}
            >
              Confirmar
            </Button>
          )}
          <Button 
            size="small" 
            danger
            onClick={() => handleCancelBooking(record.id)}
          >
            Cancelar
          </Button>
        </Space>
      )
    }
  ]

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
          <Logo size={isMobile ? "small" : "medium"} style={{ marginRight: isMobile ? '12px' : '20px' }} />
          <div>
            <Title level={4} style={{ 
              margin: 0, 
              color: '#10b981',
              fontWeight: '600',
              fontSize: isMobile ? '16px' : '20px',
              lineHeight: 1.2
            }}>
              Dashboard do Dono
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
        
        <Space size={isMobile ? 'small' : 'middle'}>
          {!isMobile && (
            <Button 
              icon={<SettingOutlined />} 
              onClick={openSettings}
              style={{
                borderRadius: '8px',
                fontWeight: '500',
                height: isMobile ? '36px' : '40px'
              }}
            >
              Configurações
            </Button>
          )}
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
        </Space>
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            color: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.1)',
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
              <Logo size={isMobile ? "medium" : "large"} style={{ 
                marginRight: isMobile ? '0' : '20px',
                marginBottom: isMobile ? '12px' : '0',
                filter: 'brightness(0) invert(1)'
              }} />
              <div>
                <Title level={isMobile ? 3 : 2} style={{ 
                  margin: 0, 
                  color: 'white', 
                  fontWeight: '600' 
                }}>
                  Gerencie suas Quadras! 🏟️
                </Title>
                <Text style={{ 
                  fontSize: isMobile ? '14px' : '16px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '400'
                }}>
                  Controle suas reservas, gerencie suas quadras e acompanhe sua receita.
                </Text>
              </div>
            </div>
          </Card>

          {/* Estatísticas Principais */}
          <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? '20px' : '32px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card style={{
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)'
              }}>
                <Statistic
                  title="Total de Quadras"
                  value={ownerStats.totalCourts || 0}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)'
              }}>
                <Statistic
                  title="Reservas Hoje"
                  value={ownerStats.bookingsToday || 0}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)'
              }}>
                <Statistic
                  title="Receita do Mês"
                  value={ownerStats.monthlyRevenue || 0}
                  prefix={<DollarOutlined />}
                  suffix="R$"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)'
              }}>
                <Statistic
                  title="Taxa de Ocupação"
                  value={ownerStats.occupancyRate || 0}
                  suffix="%"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Estatísticas Adicionais */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="Total de Reservas"
                  value={ownerStats.totalBookings || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="Reservas Pendentes"
                  value={ownerStats.pendingBookings || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="Receita Média/Reserva"
                  value={ownerStats.totalBookings > 0 ? Math.round(ownerStats.monthlyRevenue / ownerStats.totalBookings) : 0}
                  prefix={<DollarOutlined />}
                  suffix="R$"
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
          </Row>

          {/* FILTRO GRANDE E CLARO */}
          <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                    📅 Data
                  </Text>
                  <br />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: '48px', 
                      fontSize: '16px',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                    🏟️ Quadra
                  </Text>
                  <br />
                  <Select
                    placeholder="Todas as quadras"
                    style={{ 
                      width: '100%', 
                      height: '48px'
                    }}
                    size="large"
                    onChange={(value) => setSelectedCourt(value)}
                  >
                    <Option value={null}>Todas as quadras</Option>
                    {userEstablishment?.courts && userEstablishment.courts.length > 0 && userEstablishment.courts.map(court => (
                      <Option key={court.id} value={court.id}>
                        {court.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                    🔄 Ações
                  </Text>
                  <br />
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<ReloadOutlined />}
                    loading={refreshing}
                    style={{ 
                      height: '48px', 
                      width: '100%',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                    onClick={loadScheduleData}
                  >
                    Atualizar Agenda
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>

          {/* AGENDA POR QUADRA */}
          <Card title="📅 Agenda do Dia" style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]}>
              {scheduleData && scheduleData.length > 0 ? scheduleData
                .filter(court => !selectedCourt || court.courtId === selectedCourt)
                .map(court => (
                <Col xs={24} lg={8} key={court.courtId}>
                  <Card 
                    size="small"
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: getCourtColor(court.courtId),
                            borderRadius: '50%',
                            marginRight: '8px'
                          }}
                        />
                        {court.courtName}
                      </div>
                    }
                    style={{ 
                      border: `3px solid ${getCourtColor(court.courtId)}`,
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '4px',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {court.timeSlots && court.timeSlots.map((timeSlot, index) => (
                        <div key={index}>
                          {renderTimeSlot(timeSlot, court.courtId)}
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              )) : (
                <Col span={24}>
                  <Empty 
                    description="Nenhum horário disponível para esta data"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Col>
              )}
            </Row>
          </Card>

          {/* Informações do Estabelecimento */}
          {userEstablishment && (
            <Card 
              title="🏢 Meu Estabelecimento" 
              extra={
                <Button 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={() => {
                    establishmentForm.setFieldsValue({
                      name: userEstablishment?.name,
                      address: userEstablishment?.address,
                      phone: userEstablishment?.phone,
                      email: userEstablishment?.email
                    })
                    setEstablishmentModalOpen(true)
                  }}
                >
                  Editar
                </Button>
              }
              style={{ marginBottom: '24px' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                      {userEstablishment.name}
                    </Title>
                    <Text type="secondary">
                      <UserOutlined /> {userEstablishment.ownerName}
                    </Text>
                    <br />
                    <Text type="secondary">
                      📍 {userEstablishment.address}
                    </Text>
                    <br />
                    <Text type="secondary">
                      📞 {userEstablishment.phone}
                    </Text>
                    <br />
                    <Text type="secondary">
                      ⭐ {userEstablishment.rating}/5.0
                    </Text>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div>
                    <Text strong>Esportes oferecidos:</Text>
                    <div style={{ marginTop: '8px' }}>
                      {userEstablishment.sports && userEstablishment.sports.length > 0 ? userEstablishment.sports.map(sport => (
                        <Tag key={sport} color="blue" style={{ margin: '2px' }}>
                          {sport}
                        </Tag>
                      )) : (
                        <Text type="secondary">Nenhum esporte cadastrado</Text>
                      )}
                    </div>
                    <br />
                    <Text strong>Total de quadras:</Text> {userEstablishment.totalCourts}
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {/* Minhas Quadras */}
          <Card 
            title="Minhas Quadras" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={openAddCourtModal}
              >
                Adicionar Quadra
              </Button>
            }
            style={{ marginBottom: '24px' }}
          >
            {userEstablishment && userEstablishment.courts && userEstablishment.courts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {userEstablishment.courts.map(court => (
                  <Col xs={24} sm={12} md={8} key={court.id}>
                    <Card 
                      size="small"
                      title={court.name}
                      extra={
                        <Space>
                          <Button 
                            size="small" 
                            icon={<EditOutlined />} 
                            onClick={() => openEditCourtModal(court)}
                            title="Editar quadra"
                          />
                          <Button 
                            size="small" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => {
                              Modal.confirm({
                                title: 'Excluir quadra',
                                content: `Tem certeza que deseja excluir a quadra "${court.name}"?`,
                                okText: 'Sim, excluir',
                                okType: 'danger',
                                cancelText: 'Cancelar',
                                onOk: () => handleDeleteCourt(court.id)
                              })
                            }}
                            title="Excluir quadra"
                          />
                        </Space>
                      }
                    >
                      <div>
                        <Text strong>Esporte:</Text> <Tag color="blue">{court.sport}</Tag>
                        <br />
                        <Text strong>Preço:</Text> R$ {court.price || 0}/hora
                        <br />
                        <Text strong>Tipo:</Text> {court.isIndoor ? 'Coberta' : 'Descoberta'}
                        <br />
                        <Text strong>Endereço:</Text> {court.address || 'Não informado'}
                        <br />
                        <Text strong>Telefone:</Text> {court.phone || 'Não informado'}
                        <br />
                        <Text strong>Rating:</Text> ⭐ {court.rating || 0}/5.0
                        <br />
                        <Text strong>Status:</Text> 
                        <Badge 
                          status={court.isAvailable ? 'success' : 'error'} 
                          text={court.isAvailable ? 'Disponível' : 'Ocupada'}
                          style={{ marginLeft: '8px' }}
                        />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty 
                description="Nenhuma quadra cadastrada"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Reservas */}
          <Card title="Reservas" style={{ marginBottom: isMobile ? '16px' : '24px' }}>
            {isMobile ? (
              // Layout mobile com cards
              <div>
                {bookings && bookings.length > 0 ? bookings.map(booking => (
                  <Card 
                    key={booking.id} 
                    size="small" 
                    style={{ marginBottom: '12px' }}
                    title={`${booking.courtName} - ${booking.date ? booking.date.split('-').reverse().join('/') : 'Data não informada'}`}
                  >
                    <div style={{ fontSize: '14px' }}>
                      <div><strong>👤</strong> {booking.playerName}</div>
                      <div><strong>📧</strong> {booking.playerEmail}</div>
                      <div><strong>📞</strong> {booking.playerPhone}</div>
                      <div><strong>⏰</strong> {booking.time}</div>
                      <div><strong>💰</strong> R$ {booking.totalPrice?.toFixed(2)}</div>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color={booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'orange' : 'red'}>
                          {booking.status === 'confirmed' ? 'Confirmada' : booking.status === 'pending' ? 'Pendente' : 'Cancelada'}
                        </Tag>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <Space>
                          {booking.status === 'pending' && (
                            <Button 
                              size="small" 
                              type="primary" 
                              onClick={() => handleConfirmBooking(booking.id)}
                            >
                              Confirmar
                            </Button>
                          )}
                          <Button 
                            size="small" 
                            danger 
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancelar
                          </Button>
                        </Space>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <Empty 
                    description="Nenhuma reserva encontrada"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>
            ) : (
              // Layout desktop com tabela
              <Table 
                columns={columns} 
                dataSource={bookings}
                pagination={{ pageSize: 10 }}
                size="middle"
                loading={loading}
              />
            )}
          </Card>
        </div>

        {/* Modal para Adicionar/Editar Quadra */}
        <Modal
          title={editingCourt ? "Editar Quadra" : "Adicionar Nova Quadra"}
          open={courtModalOpen}
          onCancel={() => {
            setCourtModalOpen(false)
            setEditingCourt(null)
            courtForm.resetFields()
          }}
          footer={null}
          width={600}
        >
          <Form
            form={courtForm}
            layout="vertical"
            onFinish={editingCourt ? handleEditCourt : handleAddCourt}
          >
            <Form.Item
              name="name"
              label="Nome da Quadra"
              rules={[{ required: true, message: 'Digite o nome da quadra!' }]}
            >
              <Input placeholder="Ex: Quadra 1 - Futebol" />
            </Form.Item>

            <Form.Item
              name="sport"
              label="Esporte"
              rules={[{ required: true, message: 'Selecione o esporte!' }]}
            >
              <Select placeholder="Selecione o esporte">
                {sports && sports.length > 0 && sports.map(sport => (
                  <Option key={sport.id} value={sport.name}>
                    {sport.icon} {sport.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="hourlyRate"
                  label="Preço por Hora (R$)"
                  rules={[{ required: true, message: 'Digite o preço!' }]}
                >
                  <Input 
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isIndoor"
                  label="Tipo"
                  rules={[{ required: true, message: 'Selecione o tipo!' }]}
                >
                  <Select placeholder="Selecione o tipo">
                    <Option value={true}>Coberta</Option>
                    <Option value={false}>Descoberta</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setCourtModalOpen(false)
                  setEditingCourt(null)
                  courtForm.resetFields()
                }}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingCourt ? 'Salvar Alterações' : 'Adicionar Quadra'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal para Bloquear Horário */}
        <Modal
          title="🚫 Bloquear Horário"
          open={blockModalOpen}
          onCancel={() => setBlockModalOpen(false)}
          footer={null}
          width={500}
        >
          <div style={{ marginBottom: '16px', padding: '16px', background: '#f0f8ff', borderRadius: '8px' }}>
            <Text strong>Horário selecionado:</Text>
            <br />
            <Text>{selectedCourt?.timeSlot} - {selectedDate ? selectedDate.split('-').reverse().join('/') : 'Data não informada'}</Text>
          </div>

          <Form
            form={blockForm}
            layout="vertical"
            onFinish={handleBlockTimeSlot}
          >
            <Form.Item
              name="reason"
              label="Motivo do Bloqueio"
              rules={[{ required: true, message: 'Digite o motivo do bloqueio!' }]}
            >
              <Select placeholder="Selecione o motivo">
                <Option value="Manutenção">🔧 Manutenção</Option>
                <Option value="Limpeza">🧹 Limpeza</Option>
                <Option value="Evento especial">🎉 Evento especial</Option>
                <Option value="Reparo">🔨 Reparo</Option>
                <Option value="Outro">❓ Outro</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Descrição (opcional)"
            >
              <Input.TextArea 
                placeholder="Adicione mais detalhes sobre o bloqueio..."
                rows={3}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setBlockModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="primary" danger htmlType="submit">
                  🚫 Bloquear Horário
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal de Configurações */}
        <Modal
          title="⚙️ Configurações do Estabelecimento"
          open={settingsModalOpen}
          onCancel={() => setSettingsModalOpen(false)}
          footer={null}
          width={600}
        >
          <Form
            form={settingsForm}
            layout="vertical"
            onFinish={handleSaveSettings}
            initialValues={{
              name: userEstablishment?.name,
              phone: userEstablishment?.phone,
              email: userEstablishment?.email,
              address: userEstablishment?.address
            }}
          >
            <Form.Item
              name="name"
              label="Nome do Estabelecimento"
              rules={[{ required: true, message: 'Digite o nome do estabelecimento!' }]}
            >
              <Input placeholder="Ex: Quadras São Paulo" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefone"
              rules={[{ required: true, message: 'Digite o telefone!' }]}
            >
              <Input placeholder="(11) 3333-4444" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Digite o email!' },
                { type: 'email', message: 'Email inválido!' }
              ]}
            >
              <Input placeholder="contato@quadras.com" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Endereço"
              rules={[{ required: true, message: 'Digite o endereço!' }]}
            >
              <Input.TextArea 
                placeholder="Rua das Flores, 123 - Vila Madalena, São Paulo - SP"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="workingHours"
              label="Horário de Funcionamento"
            >
              <Input placeholder="08:00 às 22:00" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setSettingsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  💾 Salvar Configurações
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal para Editar Estabelecimento */}
        <Modal
          title="🏢 Editar Estabelecimento"
          open={establishmentModalOpen}
          onCancel={() => setEstablishmentModalOpen(false)}
          footer={null}
          width={600}
        >
          <Form
            form={establishmentForm}
            layout="vertical"
            onFinish={handleSaveEstablishment}
            initialValues={{
              name: userEstablishment?.name,
              address: userEstablishment?.address,
              phone: userEstablishment?.phone,
              email: userEstablishment?.email
            }}
          >
            <Form.Item
              name="name"
              label="Nome do Estabelecimento"
              rules={[{ required: true, message: 'Digite o nome do estabelecimento!' }]}
            >
              <Input placeholder="Ex: Paula Ramos Sports Center" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Endereço"
              rules={[{ required: true, message: 'Digite o endereço!' }]}
            >
              <Input.TextArea 
                placeholder="Rua das Flores, 123 - Vila Madalena, São Paulo - SP"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefone"
              rules={[{ required: true, message: 'Digite o telefone!' }]}
            >
              <Input placeholder="(11) 3333-4444" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Digite o email!' },
                { type: 'email', message: 'Email inválido!' }
              ]}
            >
              <Input placeholder="contato@paularamos.com" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setEstablishmentModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  Salvar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}

export default CourtOwnerDashboard
