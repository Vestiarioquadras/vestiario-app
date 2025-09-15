import { Image } from 'antd'
import { vestiarioStyles } from '../theme/vestiarioTheme'
import useResponsive from '../hooks/useResponsive'

/**
 * Componente de logo do Vestiário
 * Reutilizável em diferentes tamanhos e contextos
 */
const Logo = ({ 
  size = 'medium', 
  showText = true, 
  style = {},
  className = '',
  onClick = null 
}) => {
  const { isMobile, isTablet } = useResponsive()
  
  // Define tamanhos padrão responsivos
  const sizeConfig = {
    small: { 
      width: isMobile ? 80 : isTablet ? 100 : 120, 
      height: isMobile ? 40 : isTablet ? 50 : 60 
    },
    medium: { 
      width: isMobile ? 120 : isTablet ? 150 : 180, 
      height: isMobile ? 60 : isTablet ? 75 : 90 
    },
    large: { 
      width: isMobile ? 160 : isTablet ? 200 : 240, 
      height: isMobile ? 80 : isTablet ? 100 : 120 
    },
    xlarge: { 
      width: isMobile ? 200 : isTablet ? 250 : 300, 
      height: isMobile ? 100 : isTablet ? 125 : 150 
    }
  }

  const logoStyle = {
    ...sizeConfig[size],
    cursor: onClick ? 'pointer' : 'default',
    ...vestiarioStyles.logo,
    ...style
  }

  return (
    <Image
      src="/logo_e_nome_sem_fundo.png"
      alt="Vestiário - Plataforma Multi-Esportes"
      style={logoStyle}
      className={className}
      onClick={onClick}
      preview={false}
    />
  )
}

export default Logo
