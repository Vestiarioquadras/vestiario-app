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
import { mockGetSports, mockGetOwnerBookings, mockCourts, mockGetScheduleData, mockBlockTimeSlot, mockGetOwnerStats, mockConfirmBooking, mockCancelBooking } from '../utils/mockApi'
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
  const [selectedDate, setSelectedDate] = useState('2024-01-15')
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('agenda')
  const [form] = Form.useForm()
  const [blockForm] = Form.useForm()
  const [settingsForm] = Form.useForm()

  /**
   * Carrega dados iniciais
   */
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [sportsData, bookingsData, scheduleData, statsData] = await Promise.all([
        mockGetSports(),
        mockGetOwnerBookings(user?.id),
        mockGetScheduleData(selectedDate),
        mockGetOwnerStats(user?.id)
      ])
      setSports(sportsData)
      setBookings(bookingsData)
      setScheduleData(scheduleData)
      setOwnerStats(statsData)
    } catch (error) {
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
      const data = await mockGetScheduleData(selectedDate)
      setScheduleData(data)
    } catch (error) {
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
      // Simula adição de quadra
      message.success('Quadra adicionada com sucesso!')
      setCourtModalOpen(false)
      form.resetFields()
      loadInitialData()
    } catch (error) {
      message.error('Erro ao adicionar quadra')
    }
  }

  /**
   * Abre modal para bloquear horário
   */
  const openBlockModal = (courtId, timeSlot) => {
    setSelectedCourt({ courtId, timeSlot })
    setBlockModalOpen(true)
  }

  /**
   * Bloqueia horário
   */
  const handleBlockTimeSlot = async (values) => {
    try {
      const blockData = {
        courtId: selectedCourt.courtId,
        timeSlot: selectedCourt.timeSlot,
        reason: values.reason,
        date: selectedDate
      }

      const result = await mockBlockTimeSlot(blockData)
      if (result.success) {
        notification.success({
          message: 'Horário bloqueado!',
          description: result.message,
          placement: 'topRight'
        })
        setBlockModalOpen(false)
        blockForm.resetFields()
        loadScheduleData()
        loadInitialData() // Atualiza também as reservas
      }
    } catch (error) {
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
      const result = await mockConfirmBooking(bookingId)
      if (result.success) {
        notification.success({
          message: 'Reserva confirmada!',
          description: result.message,
          placement: 'topRight'
        })
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
      const result = await mockCancelBooking(bookingId, 'Cancelado pelo dono')
      if (result.success) {
        notification.success({
          message: 'Reserva cancelada!',
          description: result.message,
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

  // Encontra o estabelecimento do usuário atual
  const userEstablishment = mockCourts.find(court => court.ownerName === user?.name)

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
          <Text>{new Date(record.startTime).toLocaleDateString('pt-BR')}</Text>
          <br />
          <Text type="secondary">
            {new Date(record.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(record.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
        background: '#fff', 
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo size="small" style={{ marginRight: '16px' }} />
          <div>
            <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
              Dashboard do Dono
            </Title>
            <Text type="secondary">
              Olá, {user?.name || user?.email}!
            </Text>
          </div>
        </div>
        
        <Space>
          <Button icon={<SettingOutlined />} onClick={openSettings}>
            Configurações
          </Button>
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </Space>
      </Header>

      {/* Conteúdo Principal */}
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Boas-vindas */}
          <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Logo size="medium" style={{ marginRight: '16px' }} />
              <div>
                <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                  Gerencie suas Quadras! 🏟️
                </Title>
                <Text style={{ fontSize: '16px' }}>
                  Controle suas reservas, gerencie suas quadras e acompanhe sua receita.
                </Text>
              </div>
            </div>
          </Card>

          {/* Estatísticas Principais */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total de Quadras"
                  value={ownerStats.totalCourts || 0}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Reservas Hoje"
                  value={ownerStats.bookingsToday || 0}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
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
              <Card>
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
                    {userEstablishment?.courts.map(court => (
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
              {scheduleData.map(court => (
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
                      {court.timeSlots.map((timeSlot, index) => (
                        <div key={index}>
                          {renderTimeSlot(timeSlot, court.courtId)}
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Informações do Estabelecimento */}
          {userEstablishment && (
            <Card title="Meu Estabelecimento" style={{ marginBottom: '24px' }}>
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
                      {userEstablishment.sports.map(sport => (
                        <Tag key={sport} color="blue" style={{ margin: '2px' }}>
                          {sport}
                        </Tag>
                      ))}
                    </div>
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
                onClick={() => setCourtModalOpen(true)}
              >
                Adicionar Quadra
              </Button>
            }
            style={{ marginBottom: '24px' }}
          >
            {userEstablishment && (
              <Row gutter={[16, 16]}>
                {userEstablishment.courts.map(court => (
                  <Col xs={24} sm={12} md={8} key={court.id}>
                    <Card 
                      size="small"
                      title={court.name}
                      extra={
                        <Space>
                          <Button size="small" icon={<EditOutlined />} />
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Space>
                      }
                    >
                      <div>
                        <Text strong>Esporte:</Text> <Tag color="blue">{court.sport}</Tag>
                        <br />
                        <Text strong>Preço:</Text> R$ {court.hourlyRate}/hora
                        <br />
                        <Text strong>Tipo:</Text> {court.isIndoor ? 'Coberta' : 'Descoberta'}
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
            )}
          </Card>

          {/* Reservas */}
          <Card title="Reservas" style={{ marginBottom: isMobile ? '16px' : '24px' }}>
            {isMobile ? (
              // Layout mobile com cards
              <div>
                {bookings.map(booking => (
                  <Card 
                    key={booking.id} 
                    size="small" 
                    style={{ marginBottom: '12px' }}
                    title={`${booking.courtName} - ${new Date(booking.date).toLocaleDateString('pt-BR')}`}
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
                ))}
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

        {/* Modal para Adicionar Quadra */}
        <Modal
          title="Adicionar Nova Quadra"
          open={courtModalOpen}
          onCancel={() => setCourtModalOpen(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddCourt}
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
                {sports.map(sport => (
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
                <Button onClick={() => setCourtModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  Adicionar Quadra
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
            <Text>{selectedCourt?.timeSlot} - {new Date(selectedDate).toLocaleDateString('pt-BR')}</Text>
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
      </Content>
    </Layout>
  )
}

export default CourtOwnerDashboard
