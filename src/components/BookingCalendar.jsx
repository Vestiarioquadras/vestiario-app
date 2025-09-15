import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  Tooltip,
  Badge,
  message,
  notification,
  Modal,
  Form,
  Select,
  TimePicker,
  InputNumber
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

/**
 * Componente de calendário para reservas
 * Permite visualizar disponibilidade e fazer reservas
 */
const BookingCalendar = ({ 
  courtId, 
  courtName, 
  hourlyRate, 
  onBookingSelect,
  existingBookings = [],
  blockedSlots = []
}) => {
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Gera horários disponíveis (8h às 22h)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 22; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour,
        isAvailable: true,
        isBooked: false,
        isBlocked: false
      })
    }
    return slots
  }

  const [timeSlots, setTimeSlots] = useState(generateTimeSlots())

  /**
   * Atualiza status dos horários baseado em reservas e bloqueios
   */
  useEffect(() => {
    const updatedSlots = timeSlots.map(slot => {
      const slotDateTime = selectedDate.hour(slot.hour).minute(0)
      
      // Verifica se está bloqueado
      const isBlocked = blockedSlots.some(blocked => 
        dayjs(blocked.date).isSame(selectedDate, 'day') && 
        blocked.timeSlot === slot.time
      )

      // Verifica se está reservado
      const isBooked = existingBookings.some(booking => {
        const bookingStart = dayjs(booking.startTime)
        const bookingEnd = dayjs(booking.endTime)
        return bookingStart.isSame(slotDateTime, 'hour') || 
               (slotDateTime.isAfter(bookingStart) && slotDateTime.isBefore(bookingEnd))
      })

      return {
        ...slot,
        isAvailable: !isBooked && !isBlocked,
        isBooked,
        isBlocked
      }
    })

    setTimeSlots(updatedSlots)
  }, [selectedDate, existingBookings, blockedSlots])

  /**
   * Navega para o dia anterior
   */
  const goToPreviousDay = () => {
    setSelectedDate(selectedDate.subtract(1, 'day'))
    setSelectedTimeSlot(null)
  }

  /**
   * Navega para o próximo dia
   */
  const goToNextDay = () => {
    setSelectedDate(selectedDate.add(1, 'day'))
    setSelectedTimeSlot(null)
  }

  /**
   * Vai para hoje
   */
  const goToToday = () => {
    setSelectedDate(dayjs())
    setSelectedTimeSlot(null)
  }

  /**
   * Seleciona um horário
   */
  const selectTimeSlot = (slot) => {
    if (!slot.isAvailable) {
      message.warning('Este horário não está disponível')
      return
    }

    setSelectedTimeSlot(slot)
    setBookingModalOpen(true)
  }

  /**
   * Cria uma reserva
   */
  const handleCreateBooking = async (values) => {
    try {
      const startTime = selectedDate.hour(selectedTimeSlot.hour).minute(0)
      const endTime = startTime.add(values.duration, 'hour')
      
      const bookingData = {
        courtId,
        courtName,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: values.duration,
        totalPrice: values.duration * hourlyRate,
        sport: values.sport,
        players: values.players || 1,
        notes: values.notes
      }

      // Chama callback para processar a reserva
      await onBookingSelect(bookingData)
      
      setBookingModalOpen(false)
      form.resetFields()
      setSelectedTimeSlot(null)

      notification.success({
        message: 'Reserva criada!',
        description: `Horário ${selectedTimeSlot.time} reservado com sucesso`,
        placement: 'topRight'
      })

    } catch (error) {
      notification.error({
        message: 'Erro ao criar reserva',
        description: error.message || 'Tente novamente',
        placement: 'topRight'
      })
    }
  }

  /**
   * Renderiza um slot de horário
   */
  const renderTimeSlot = (slot) => {
    const isSelected = selectedTimeSlot?.time === slot.time
    const isPast = selectedDate.isBefore(dayjs(), 'day') || 
                   (selectedDate.isSame(dayjs(), 'day') && slot.hour <= dayjs().hour())

    let statusColor = '#f0f0f0'
    let statusText = 'Disponível'
    let cursor = 'pointer'

    if (slot.isBooked) {
      statusColor = '#e6f7ff'
      statusText = 'Reservado'
      cursor = 'not-allowed'
    } else if (slot.isBlocked) {
      statusColor = '#fff2e8'
      statusText = 'Bloqueado'
      cursor = 'not-allowed'
    } else if (isPast) {
      statusColor = '#f5f5f5'
      statusText = 'Passado'
      cursor = 'not-allowed'
    }

    return (
      <Tooltip 
        title={
          slot.isBooked ? 'Horário já reservado' :
          slot.isBlocked ? 'Horário bloqueado' :
          isPast ? 'Horário já passou' :
          `Reservar ${slot.time} - R$ ${hourlyRate}/hora`
        }
        key={slot.time}
      >
        <Card
          size="small"
          style={{
            margin: '4px',
            cursor,
            border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
            backgroundColor: statusColor,
            minHeight: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
          onClick={() => selectTimeSlot(slot)}
          hoverable={slot.isAvailable && !isPast}
        >
          <Text strong style={{ fontSize: '14px', marginBottom: '4px' }}>
            {slot.time}
          </Text>
          <Text type="secondary" style={{ fontSize: '10px' }}>
            {statusText}
          </Text>
          {slot.isBooked && <Badge status="error" />}
          {slot.isBlocked && <Badge status="warning" />}
          {slot.isAvailable && !isPast && <Badge status="success" />}
        </Card>
      </Tooltip>
    )
  }

  return (
    <div>
      {/* Cabeçalho do Calendário */}
      <Card style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <CalendarOutlined /> {courtName}
            </Title>
            <Text type="secondary">
              R$ {hourlyRate}/hora • {selectedDate.format('DD/MM/YYYY')}
            </Text>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<CalendarOutlined />} 
                onClick={goToToday}
                size="small"
              >
                Hoje
              </Button>
              <Button 
                icon={<CloseCircleOutlined />} 
                onClick={goToPreviousDay}
                size="small"
              >
                Anterior
              </Button>
              <Button 
                icon={<CheckCircleOutlined />} 
                onClick={goToNextDay}
                size="small"
              >
                Próximo
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Grid de Horários */}
      <Card>
        <Row gutter={[8, 8]}>
          {timeSlots.map(slot => (
            <Col xs={8} sm={6} md={4} lg={3} key={slot.time}>
              {renderTimeSlot(slot)}
            </Col>
          ))}
        </Row>

        {/* Legenda */}
        <div style={{ marginTop: '16px', padding: '12px', background: '#fafafa', borderRadius: '6px' }}>
          <Text strong>Legenda:</Text>
          <Space style={{ marginLeft: '16px' }}>
            <Badge status="success" text="Disponível" />
            <Badge status="error" text="Reservado" />
            <Badge status="warning" text="Bloqueado" />
            <Badge status="default" text="Passado" />
          </Space>
        </div>
      </Card>

      {/* Modal de Reserva */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PlusOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
            <span>Nova Reserva - {selectedTimeSlot?.time}</span>
          </div>
        }
        open={bookingModalOpen}
        onCancel={() => setBookingModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBooking}
          initialValues={{
            duration: 1,
            players: 1
          }}
        >
          <div style={{ 
            background: '#f6ffed', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px' 
          }}>
            <Text strong>Horário selecionado:</Text>
            <br />
            <Text>
              {selectedDate.format('DD/MM/YYYY')} às {selectedTimeSlot?.time}
            </Text>
            <br />
            <Text type="secondary">
              Quadra: {courtName} • R$ {hourlyRate}/hora
            </Text>
          </div>

          <Form.Item
            name="sport"
            label="Esporte"
            rules={[{ required: true, message: 'Selecione o esporte!' }]}
          >
            <Select placeholder="Selecione o esporte">
              <Option value="futebol">⚽ Futebol</Option>
              <Option value="futsal">🥅 Futsal</Option>
              <Option value="basquete">🏀 Basquete</Option>
              <Option value="vôlei">🏐 Vôlei</Option>
              <Option value="tênis">🎾 Tênis</Option>
              <Option value="padel">🏓 Padel</Option>
              <Option value="handebol">🤾 Handebol</Option>
              <Option value="badminton">🏸 Badminton</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duração (horas)"
                rules={[{ required: true, message: 'Selecione a duração!' }]}
              >
                <Select>
                  <Option value={1}>1 hora</Option>
                  <Option value={2}>2 horas</Option>
                  <Option value={3}>3 horas</Option>
                  <Option value={4}>4 horas</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="players"
                label="Número de Jogadores"
                rules={[{ required: true, message: 'Digite o número de jogadores!' }]}
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Observações (opcional)"
          >
            <Input.TextArea
              placeholder="Adicione observações sobre a reserva..."
              rows={3}
            />
          </Form.Item>

          <div style={{ 
            background: '#e6f7ff', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px' 
          }}>
            <Text strong>Resumo:</Text>
            <br />
            <Text>
              Duração: {form.getFieldValue('duration') || 1} hora(s)
            </Text>
            <br />
            <Text>
              Valor total: R$ {((form.getFieldValue('duration') || 1) * hourlyRate).toFixed(2)}
            </Text>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setBookingModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                <PlusOutlined /> Confirmar Reserva
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BookingCalendar

