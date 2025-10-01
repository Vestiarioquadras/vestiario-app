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
import { courtsService, sportsService, bookingsService, statsService, scheduleService, notificationsService } from '../services/firestoreService'
import Logo from '../components/Logo'
import ImageUploadSimple from '../components/ImageUploadSimple'
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
  const [courtImages, setCourtImages] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
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
      const [sportsData, bookingsData, scheduleData, statsData, courtsData, notificationsData] = await Promise.all([
        sportsService.getAllSports(),
        bookingsService.getOwnerBookings(user.uid),
        scheduleService.getScheduleData(selectedDate),
        statsService.getOwnerStats(user.uid),
        courtsService.getCourtsByOwner(user.uid),
        notificationsService.getOwnerNotifications(user.uid)
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
      setNotifications(notificationsData)
      setUnreadNotifications(notificationsData.filter(n => !n.isRead).length)
      
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
        sports: values.sports || [values.sport], // Suporte para múltiplos esportes
        sport: values.sports?.[0] || values.sport, // Manter compatibilidade
        location: userEstablishment?.location || 'Local não informado',
        address: userEstablishment?.address || 'Endereço não informado',
        price: values.hourlyRate || 80.00,
        description: values.description || 'Quadra de esporte',
        capacity: values.capacity || 10,
        rules: values.rules || '',
        amenities: values.amenities || [],
        isIndoor: values.isIndoor,
        ownerId: user?.uid,
        ownerName: user?.displayName || 'Proprietário',
        phone: userEstablishment?.phone || '(11) 99999-9999',
        email: user?.email,
        images: courtImages || [],
        rating: 0,
        totalReviews: 0,
        isAvailable: true,
        establishmentName: userEstablishment?.name || 'Meu Estabelecimento'
      }

      // Remover campos undefined
      Object.keys(newCourt).forEach(key => {
        if (newCourt[key] === undefined) {
          delete newCourt[key]
        }
      })

      await courtsService.createCourt(newCourt)
      
      message.success('✅ Quadra adicionada com sucesso!')
      setCourtModalOpen(false)
      courtForm.resetFields()
      setEditingCourt(null)
      
      // Recarregar dados
      loadInitialData()
    } catch (error) {
      console.error('Erro ao adicionar quadra:', error)
      message.error('❌ Erro ao adicionar quadra')
    }
  }

  /**
   * Edita quadra existente
   */
  const handleEditCourt = async (values) => {
    try {
      console.log('🔧 Iniciando edição da quadra:', editingCourt?.id)
      console.log('📋 Valores do formulário:', values)
      console.log('🖼️ Imagens atuais:', courtImages)
      
      if (!editingCourt) {
        console.error('❌ Quadra não encontrada para edição')
        message.error('❌ Quadra não encontrada')
        return
      }

      // Filtrar valores undefined para evitar erro no Firestore
      const updatedCourtData = {
        name: values.name,
        sports: values.sports && values.sports.length > 0 ? values.sports : editingCourt.sports || [editingCourt.sport], // Suporte para múltiplos esportes
        sport: values.sports && values.sports.length > 0 ? values.sports[0] : editingCourt.sport, // Manter compatibilidade
        price: values.hourlyRate !== undefined ? values.hourlyRate : editingCourt.price,
        description: values.description || editingCourt.description || '',
        capacity: values.capacity !== undefined ? values.capacity : editingCourt.capacity,
        rules: values.rules || editingCourt.rules || '',
        amenities: values.amenities || editingCourt.amenities || [],
        isIndoor: values.isIndoor !== undefined ? values.isIndoor : editingCourt.isIndoor,
        images: courtImages || []
      }

      // Remover campos undefined
      Object.keys(updatedCourtData).forEach(key => {
        if (updatedCourtData[key] === undefined) {
          delete updatedCourtData[key]
        }
      })

      console.log('📝 Dados preparados para atualização:', updatedCourtData)
      console.log('🆔 ID da quadra:', editingCourt.id)

      await courtsService.updateCourt(editingCourt.id, updatedCourtData)
      
      console.log('✅ Quadra editada com sucesso!')
      message.success('✅ Quadra editada com sucesso!')
      setCourtModalOpen(false)
      courtForm.resetFields()
      setEditingCourt(null)
      setCourtImages([])
      
      // Recarregar dados
      console.log('🔄 Recarregando dados...')
      loadInitialData()
    } catch (error) {
      console.error('❌ Erro ao editar quadra:', error)
      console.error('🔍 Detalhes do erro:', {
        name: error.name,
        message: error.message,
        code: error.code,
        editingCourt: editingCourt,
        values: values
      })
      message.error('❌ Erro ao editar quadra')
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
    console.log('🔧 Abrindo modal para editar quadra:', court)
    setEditingCourt(court)
    setCourtImages(court.images || [])
      courtForm.setFieldsValue({
        name: court.name,
        sports: court.sports || [court.sport], // Carregar múltiplos esportes
        sport: court.sport, // Manter compatibilidade
      hourlyRate: court.price,
      isIndoor: court.isIndoor,
      description: court.description || '',
      amenities: court.amenities || [],
      capacity: court.capacity || 10,
      rules: court.rules || ''
    })
    setCourtModalOpen(true)
  }

  /**
   * Abre modal para adicionar quadra
   */
  const openAddCourtModal = () => {
    setEditingCourt(null)
    setCourtImages([])
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
          {/* Ações Rápidas */}
          <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? '20px' : '32px' }}>
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable
                style={{ 
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #B1EC32 0%, #8BC34A 100%)',
                  border: 'none',
                  color: 'white',
                  textAlign: 'center',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  setCourtModalOpen(true)
                  message.success('📝 Abrindo formulário para adicionar quadra...')
                }}
              >
                <div>
                  <PlusOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    Adicionar Quadra
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable
                style={{ 
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  color: 'white',
                  textAlign: 'center',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  // Navegar para seção de agenda
                  const agendaSection = document.getElementById('agenda-section')
                  if (agendaSection) {
                    agendaSection.scrollIntoView({ behavior: 'smooth' })
                    message.success('📅 Navegando para agenda...')
                  } else {
                    // Se não encontrar, abrir modal
                    setScheduleModalOpen(true)
                    message.success('📅 Abrindo agenda...')
                  }
                }}
              >
                <div>
                  <CalendarOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    Ver Agenda
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card 
                hoverable
                style={{ 
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none',
                  color: 'white',
                  textAlign: 'center',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  // Scroll para seção de estatísticas ou abrir modal
                  const statsSection = document.getElementById('stats-section')
                  if (statsSection) {
                    statsSection.scrollIntoView({ behavior: 'smooth' })
                    message.success('📊 Navegando para estatísticas...')
                  } else {
                    // Se não encontrar, recarregar dados
                    loadInitialData()
                    message.success('📊 Atualizando estatísticas...')
                  }
                }}
              >
                <div>
                  <BarChartOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>
                    Ver Estatísticas
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Estatísticas Principais */}
          <Row gutter={[16, 16]} style={{ marginBottom: isMobile ? '20px' : '32px' }} id="stats-section">
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
          <Card style={{ 
            marginBottom: '24px', 
            background: 'linear-gradient(135deg, #B1EC32 0%, #8BC34A 100%)',
            borderRadius: '16px',
            boxShadow: '0 8px 25px -5px rgba(177, 236, 50, 0.3), 0 4px 6px -2px rgba(177, 236, 50, 0.1)'
          }}>
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
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.9)',
                      color: '#333'
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
                      height: '48px',
                      borderRadius: '12px'
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
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.3)'
                      e.target.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.2)'
                      e.target.style.transform = 'translateY(0)'
                    }}
                    onClick={loadScheduleData}
                    title="Dono precisa de controle ativo - atualizar reservas e agenda em tempo real"
                  >
                    Atualizar Agenda
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>

          {/* AGENDA POR QUADRA */}
          <Card title="📅 Agenda do Dia" style={{ marginBottom: '24px' }} id="agenda-section">
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
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{court.name}</span>
                          <Tag color={court.isIndoor ? 'blue' : 'green'}>
                            {court.isIndoor ? '🏠 Coberta' : '☀️ Descoberta'}
                          </Tag>
                        </div>
                      }
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
                      style={{ 
                        border: `2px solid ${court.isIndoor ? '#1890ff' : '#52c41a'}`,
                        borderRadius: '12px'
                      }}
                    >
                      <div>
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <Text strong>⚽ Esportes:</Text> 
                            <div style={{ marginTop: '4px' }}>
                              {(court.sports || [court.sport]).map((sport, index) => (
                                <Tag key={index} color="blue" style={{ margin: '2px' }}>
                                  {sport}
                                </Tag>
                              ))}
                            </div>
                          </Col>
                          <Col span={12}>
                            <Text strong>💰 Preço:</Text> R$ {court.price || 0}/hora
                          </Col>
                          <Col span={12}>
                            <Text strong>👥 Capacidade:</Text> {court.capacity || 'N/A'} pessoas
                          </Col>
                          <Col span={12}>
                            <Text strong>⭐ Rating:</Text> {court.rating || 0}/5.0
                          </Col>
                        </Row>
                        
                        {court.description && (
                          <div style={{ marginTop: '8px' }}>
                            <Text strong>📝 Descrição:</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {court.description}
                            </Text>
                          </div>
                        )}

                        {court.amenities && court.amenities.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <Text strong>🏢 Comodidades:</Text>
                            <br />
                            <div style={{ marginTop: '4px' }}>
                              {court.amenities.slice(0, 3).map(amenity => (
                                <Tag key={amenity} size="small" style={{ margin: '2px' }}>
                                  {amenity}
                                </Tag>
                              ))}
                              {court.amenities.length > 3 && (
                                <Tag size="small" style={{ margin: '2px' }}>
                                  +{court.amenities.length - 3} mais
                                </Tag>
                              )}
                            </div>
                          </div>
                        )}

                        {court.images && court.images.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <Text strong>📸 Fotos:</Text>
                            <br />
                            <div style={{ 
                              display: 'flex', 
                              gap: '4px', 
                              marginTop: '4px',
                              overflowX: 'auto'
                            }}>
                              {court.images.slice(0, 3).map((image, index) => (
                                <div
                                  key={index}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    border: '1px solid #d9d9d9',
                                    flexShrink: 0
                                  }}
                                >
                                  <img
                                    src={image.url}
                                    alt={`Foto ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </div>
                              ))}
                              {court.images.length > 3 && (
                                <div
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '4px',
                                    border: '1px solid #d9d9d9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f5f5f5',
                                    fontSize: '10px',
                                    color: '#666'
                                  }}
                                >
                                  +{court.images.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Badge 
                            status={court.isAvailable ? 'success' : 'error'} 
                            text={court.isAvailable ? '✅ Disponível' : '❌ Ocupada'}
                          />
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            📍 {court.address || 'Endereço não informado'}
                          </Text>
                        </div>
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
                        <Tag color={booking.status === 'confirmed' ? 'green' : booking.status === 'pending' ? 'green' : 'red'}>
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
          title={editingCourt ? "✏️ Editar Quadra" : "➕ Adicionar Nova Quadra"}
          open={courtModalOpen}
          onCancel={() => {
            setCourtModalOpen(false)
            setEditingCourt(null)
            setCourtImages([])
            courtForm.resetFields()
          }}
          footer={null}
          width={800}
        >
          <Form
            form={courtForm}
            layout="vertical"
            onFinish={editingCourt ? handleEditCourt : handleAddCourt}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="🏟️ Nome da Quadra"
                  rules={[{ required: true, message: 'Digite o nome da quadra!' }]}
                >
                  <Input placeholder="Ex: Quadra 1 - Futebol" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sports"
                  label="⚽ Esportes"
                  rules={editingCourt ? [] : [{ required: true, message: 'Selecione pelo menos um esporte!' }]}
                  help={editingCourt ? "Deixe em branco para manter os esportes atuais" : "Selecione todos os esportes que podem ser praticados nesta quadra"}
                >
                  <Select 
                    mode="multiple"
                    placeholder="Selecione os esportes"
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {sports && sports.length > 0 && sports.map(sport => (
                      <Option key={sport.id} value={sport.name}>
                        {sport.icon} {sport.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="hourlyRate"
                  label="💰 Preço por Hora (R$)"
                  rules={editingCourt ? [] : [{ required: true, message: 'Digite o preço!' }]}
                  help={editingCourt ? "Deixe em branco para manter o preço atual" : "Digite o preço por hora"}
                >
                  <Input 
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    prefix="R$"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="isIndoor"
                  label="🏠 Tipo"
                  rules={editingCourt ? [] : [{ required: true, message: 'Selecione o tipo!' }]}
                  help={editingCourt ? "Deixe em branco para manter o tipo atual" : "Selecione se a quadra é coberta ou descoberta"}
                >
                  <Select placeholder={editingCourt ? "Manter tipo atual" : "Selecione o tipo"}>
                    <Option value={true}>🏠 Coberta</Option>
                    <Option value={false}>☀️ Descoberta</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="capacity"
                  label="👥 Capacidade"
                  rules={editingCourt ? [] : [{ required: true, message: 'Digite a capacidade!' }]}
                  help={editingCourt ? "Deixe em branco para manter a capacidade atual" : "Digite a capacidade máxima"}
                >
                  <Input 
                    type="number"
                    placeholder="Ex: 10"
                    suffix="pessoas"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="📝 Descrição da Quadra"
            >
              <Input.TextArea 
                placeholder="Descreva as características da quadra, dimensões, piso, etc..."
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="amenities"
              label="🏢 Comodidades do Estabelecimento"
              help="Selecione as comodidades disponíveis no seu estabelecimento"
            >
              <Select
                mode="multiple"
                placeholder="Selecione as comodidades disponíveis"
                style={{ width: '100%' }}
                options={[
                  { label: '🚿 Vestiário', value: 'vestiario' },
                  { label: '🚰 Bebedouro', value: 'bebedouro' },
                  { label: '🅿️ Estacionamento', value: 'estacionamento' },
                  { label: '👕 Colete', value: 'colete' },
                  { label: '⚽ Bola', value: 'bola' },
                  { label: '🏓 Raquete', value: 'raquete' },
                  { label: '🌡️ Ar Condicionado', value: 'ar_condicionado' },
                  { label: '🔊 Som', value: 'som' },
                  { label: '💡 Iluminação', value: 'iluminacao' },
                  { label: '🏥 Primeiros Socorros', value: 'primeiros_socorros' },
                  { label: '🍽️ Lanchonete', value: 'lanchonete' },
                  { label: '🚻 Banheiro', value: 'banheiro' },
                  { label: '🔌 Wi-Fi', value: 'wifi' },
                  { label: '📺 TV', value: 'tv' },
                  { label: '🪑 Cadeiras', value: 'cadeiras' }
                ]}
              />
            </Form.Item>

            <Form.Item
              name="rules"
              label="📋 Regras da Quadra"
            >
              <Input.TextArea 
                placeholder="Ex: Proibido fumar, uso obrigatório de tênis, etc..."
                rows={2}
              />
            </Form.Item>

            <Form.Item
              label="📸 Fotos da Quadra"
              help="Adicione fotos para mostrar sua quadra aos clientes"
            >
          <ImageUploadSimple
            images={courtImages}
            onImagesChange={setCourtImages}
            maxImages={5}
            maxSize={5}
            disabled={false}
          />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setCourtModalOpen(false)
                  setEditingCourt(null)
                  setCourtImages([])
                  courtForm.resetFields()
                }}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  {editingCourt ? '💾 Salvar Alterações' : '➕ Adicionar Quadra'}
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
