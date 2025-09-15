import { useState, useEffect } from 'react'

/**
 * Hook personalizado para responsividade
 * Detecta o tamanho da tela e fornece breakpoints
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Breakpoints
  const breakpoints = {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600
  }

  // Detectar breakpoint atual
  const getCurrentBreakpoint = () => {
    const width = screenSize.width
    
    if (width < breakpoints.xs) return 'xs'
    if (width < breakpoints.sm) return 'sm'
    if (width < breakpoints.md) return 'md'
    if (width < breakpoints.lg) return 'lg'
    if (width < breakpoints.xl) return 'xl'
    return 'xxl'
  }

  const currentBreakpoint = getCurrentBreakpoint()

  // Helpers para responsividade
  const isMobile = screenSize.width < breakpoints.md
  const isTablet = screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg
  const isDesktop = screenSize.width >= breakpoints.lg
  const isLargeScreen = screenSize.width >= breakpoints.xl

  // Configurações responsivas
  const getResponsiveConfig = () => {
    const config = {
      // Espaçamentos
      spacing: {
        xs: { padding: 8, margin: 8, gap: 8 },
        sm: { padding: 12, margin: 12, gap: 12 },
        md: { padding: 16, margin: 16, gap: 16 },
        lg: { padding: 24, margin: 24, gap: 24 },
        xl: { padding: 32, margin: 32, gap: 32 }
      },
      
      // Tamanhos de fonte
      fontSize: {
        xs: { base: 12, lg: 14, xl: 16 },
        sm: { base: 14, lg: 16, xl: 18 },
        md: { base: 16, lg: 18, xl: 20 },
        lg: { base: 18, lg: 20, xl: 24 },
        xl: { base: 20, lg: 24, xl: 28 }
      },
      
      // Layout
      layout: {
        container: {
          xs: { maxWidth: '100%', padding: '8px' },
          sm: { maxWidth: '540px', padding: '12px' },
          md: { maxWidth: '720px', padding: '16px' },
          lg: { maxWidth: '960px', padding: '20px' },
          xl: { maxWidth: '1140px', padding: '24px' },
          xxl: { maxWidth: '1320px', padding: '32px' }
        }
      }
    }

    return config
  }

  const responsiveConfig = getResponsiveConfig()

  // Função para obter configuração baseada no breakpoint
  const getConfig = (type, size = 'md') => {
    return responsiveConfig[type]?.[size] || responsiveConfig[type]?.md
  }

  return {
    screenSize,
    currentBreakpoint,
    breakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    responsiveConfig,
    getConfig
  }
}

export default useResponsive
