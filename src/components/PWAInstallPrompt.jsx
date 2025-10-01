import { useState, useEffect } from 'react'
import { Button, Card, Space, Typography, Modal } from 'antd'
import { DownloadOutlined, CloseOutlined, MobileOutlined, CloudOutlined, BellOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

/**
 * Componente para prompt de instalação PWA
 * Exibe um modal elegante para instalar o app
 * Mostra apenas uma vez por sessão, respeitando as preferências do usuário
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verifica se o app já foi instalado
    const checkIfInstalled = () => {
      // Verifica se está rodando como PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInApp = window.navigator.standalone === true
      
      if (isStandalone || isInApp) {
        setIsInstalled(true)
        return
      }

      // Verifica se já foi instalado anteriormente
      const installed = localStorage.getItem('pwa-installed')
      if (installed === 'true') {
        setIsInstalled(true)
      }
    }

    checkIfInstalled()

    // Verifica se o usuário já dispensou o prompt recentemente
    const checkDismissedStatus = () => {
      const dismissedUntil = localStorage.getItem('pwa-install-dismissed')
      const laterUntil = localStorage.getItem('pwa-install-later')
      
      if (dismissedUntil) {
        const dismissedDate = new Date(dismissedUntil)
        if (dismissedDate > new Date()) {
          return false // Ainda no período de dispensa
        }
      }
      
      if (laterUntil) {
        const laterDate = new Date(laterUntil)
        if (laterDate > new Date()) {
          return false // Ainda no período de "lembrar depois"
        }
      }
      
      return true // Pode mostrar o prompt
    }

    // Escuta o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Verifica se pode mostrar o prompt
      if (!isInstalled && checkDismissedStatus()) {
        // Mostra o prompt após um delay para não ser intrusivo
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 5000) // 5 segundos após carregar
      }
    }

    // Para localhost, mostra um prompt informativo (apenas se não foi dispensado)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocalhost && !isInstalled && checkDismissedStatus()) {
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 7000) // 7 segundos para localhost
    }

    // Escuta quando o app é instalado
    const handleAppInstalled = () => {
      console.log('PWA foi instalado!')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      localStorage.setItem('pwa-installed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      // Mostra o prompt de instalação
      deferredPrompt.prompt()
      
      // Aguarda a resposta do usuário
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação')
        setIsInstalled(true)
        setShowInstallPrompt(false)
        localStorage.setItem('pwa-installed', 'true')
      } else {
        console.log('Usuário rejeitou a instalação')
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Não mostra novamente por 30 dias (mais tempo para não incomodar)
    const dismissUntil = new Date()
    dismissUntil.setDate(dismissUntil.getDate() + 30)
    localStorage.setItem('pwa-install-dismissed', dismissUntil.toISOString())
  }

  const handleLater = () => {
    setShowInstallPrompt(false)
    // Mostra novamente em 3 dias (mais tempo para não incomodar)
    const showAgain = new Date()
    showAgain.setDate(showAgain.getDate() + 3)
    localStorage.setItem('pwa-install-later', showAgain.toISOString())
  }

  // Não mostra se já foi instalado
  if (isInstalled || !showInstallPrompt) {
    return null
  }

  return (
    <Modal
      open={showInstallPrompt}
      onCancel={handleDismiss}
      footer={null}
      centered
      width={420}
      closable={false}
      maskClosable={false}
      style={{ top: 20 }}
    >
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        {/* Logo principal do Vestiário */}
        <div style={{ 
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="/logo_e_nome_sem_fundo1.png" 
            alt="Vestiário" 
            style={{ 
              maxWidth: '120px', 
              height: 'auto',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
            }} 
          />
        </div>
        
        <Title level={3} style={{ marginBottom: '12px', color: '#1f2937' }}>
          {window.location.hostname === 'localhost' ? 'PWA Vestiário' : 'Instalar Vestiário'}
        </Title>
        
        <Paragraph style={{ marginBottom: '24px', color: '#6b7280', fontSize: '15px' }}>
          {window.location.hostname === 'localhost' 
            ? 'Você está testando o PWA no localhost. Em produção (HTTPS), este app pode ser instalado como um aplicativo nativo!'
            : 'Instale o Vestiário no seu dispositivo para ter acesso rápido e funcionalidade offline!'
          }
        </Paragraph>

        {/* Lista de benefícios */}
        <div style={{ 
          background: '#f8fafc', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '28px',
          textAlign: 'left',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <MobileOutlined style={{ marginRight: '12px', color: '#3b82f6', fontSize: '18px' }} />
            <Text strong style={{ color: '#374151' }}>Acesso rápido</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <CloudOutlined style={{ marginRight: '12px', color: '#10b981', fontSize: '18px' }} />
            <Text strong style={{ color: '#374151' }}>Funciona offline</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BellOutlined style={{ marginRight: '12px', color: '#f59e0b', fontSize: '18px' }} />
            <Text strong style={{ color: '#374151' }}>Notificações push</Text>
          </div>
        </div>

        {/* Botões de ação */}
        <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={handleInstall}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #B1EC32 0%, #B1EC32 100%)',
              border: 'none',
              fontWeight: '600',
              height: '48px',
              paddingLeft: '24px',
              paddingRight: '24px',
              boxShadow: '0 4px 12px rgba(255, 94, 14, 0.3)'
            }}
          >
            Instalar Agora
          </Button>
          
          <Button 
            onClick={handleLater}
            size="large"
            style={{
              height: '48px',
              paddingLeft: '20px',
              paddingRight: '20px',
              fontWeight: '500'
            }}
          >
            Lembrar Depois
          </Button>
        </Space>

        {/* Opção de dispensar */}
        <div style={{ marginTop: '20px' }}>
          <Button 
            type="link" 
            icon={<CloseOutlined />}
            onClick={handleDismiss}
            style={{ 
              color: '#9ca3af',
              fontSize: '14px',
              height: 'auto',
              padding: '4px 8px'
            }}
          >
            Não, obrigado
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PWAInstallPrompt
