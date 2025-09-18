import { Image } from 'antd'
import { vestiarioStyles } from '../theme/vestiarioTheme'
import useResponsive from '../hooks/useResponsive'

/**
 * Componente de logo do Vestiário
 * Reutilizável em diferentes tamanhos e contextos
 * Otimizado para diferentes dispositivos e resoluções
 */
const Logo = ({ 
  size = 'medium', 
  showText = true, 
  style = {},
  className = '',
  onClick = null,
  fallback = null
}) => {
  const { isMobile, isTablet } = useResponsive()
  
  // Define tamanhos padrão responsivos com melhor proporção
  const sizeConfig = {
    small: { 
      width: isMobile ? 90 : isTablet ? 110 : 130, 
      height: isMobile ? 45 : isTablet ? 55 : 65 
    },
    medium: { 
      width: isMobile ? 140 : isTablet ? 170 : 200, 
      height: isMobile ? 70 : isTablet ? 85 : 100 
    },
    large: { 
      width: isMobile ? 180 : isTablet ? 220 : 260, 
      height: isMobile ? 90 : isTablet ? 110 : 130 
    },
    xlarge: { 
      width: isMobile ? 220 : isTablet ? 270 : 320, 
      height: isMobile ? 110 : isTablet ? 135 : 160 
    }
  }

  const logoStyle = {
    ...sizeConfig[size],
    cursor: onClick ? 'pointer' : 'default',
    objectFit: 'contain', // Garante que a imagem mantenha proporção
    maxWidth: '100%', // Evita overflow em telas pequenas
    height: 'auto', // Mantém proporção automática
    ...vestiarioStyles.logo,
    ...style
  }

  // Fallback para caso a imagem não carregue
  const handleError = () => {
    console.warn('Logo não pôde ser carregado, usando fallback')
  }

  return (
    <Image
      src="/logo_e_nome_sem_fundo.png"
      alt="Vestiário - Plataforma Multi-Esportes"
      style={logoStyle}
      className={className}
      onClick={onClick}
      preview={false}
      onError={handleError}
      fallback={fallback || (
        <div 
          style={{
            ...logoStyle,
            background: 'linear-gradient(135deg, #ff5e0e 0%, #ff8c42 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: isMobile ? '14px' : '16px',
            borderRadius: '8px'
          }}
        >
          VESTIÁRIO
        </div>
      )}
    />
  )
}

export default Logo
