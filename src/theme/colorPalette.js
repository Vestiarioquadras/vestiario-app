/**
 * Paleta de cores harmoniosas para o Vestiário App
 * Baseada na cor laranja principal #ff5e0d
 */

// Cores principais baseadas na logo
export const primaryColors = {
  orange: '#ff5e0d',      // Cor principal da logo
  orangeLight: '#fb923c', // Laranja claro
  orangeDark: '#ea580c',  // Laranja escuro
  orangeDarker: '#c2410c' // Laranja mais escuro
}

// Cores complementares que harmonizam com o laranja
export const complementaryColors = {
  // Azul complementar (oposto no círculo cromático)
  blue: '#0ea5e9',
  blueLight: '#38bdf8',
  blueDark: '#0284c7',
  
  // Verde complementar (triádico)
  green: '#10b981',
  greenLight: '#34d399',
  greenDark: '#059669',
  
  // Roxo complementar (análogo)
  purple: '#8b5cf6',
  purpleLight: '#a78bfa',
  purpleDark: '#7c3aed'
}

// Cores neutras que combinam com o laranja
export const neutralColors = {
  // Tons de cinza quentes
  gray50: '#fafaf9',
  gray100: '#f5f5f4',
  gray200: '#e7e5e4',
  gray300: '#d6d3d1',
  gray400: '#a8a29e',
  gray500: '#78716c',
  gray600: '#57534e',
  gray700: '#44403c',
  gray800: '#292524',
  gray900: '#1c1917',
  
  // Tons de bege/caramelo que harmonizam
  beige50: '#fefdfb',
  beige100: '#fef3c7',
  beige200: '#fde68a',
  beige300: '#fcd34d',
  beige400: '#fbbf24',
  beige500: '#f59e0b'
}

// Cores de status
export const statusColors = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9'
}

// Gradientes harmoniosos
export const harmoniousGradients = {
  // Gradientes principais
  primary: 'linear-gradient(135deg, #ff5e0d 0%, #fb923c 100%)',
  primaryDark: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
  
  // Gradientes complementares
  complementary: 'linear-gradient(135deg, #ff5e0d 0%, #0ea5e9 100%)',
  triadic: 'linear-gradient(135deg, #ff5e0d 0%, #10b981 100%)',
  analogous: 'linear-gradient(135deg, #ff5e0d 0%, #8b5cf6 100%)',
  
  // Gradientes neutros
  warm: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
  cool: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
  
  // Gradientes de status
  success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  info: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)'
}

// Combinações de cores para diferentes contextos
export const colorCombinations = {
  // Para backgrounds
  background: {
    primary: '#fff7ed',
    secondary: '#ffedd5',
    tertiary: '#fed7aa'
  },
  
  // Para textos
  text: {
    primary: '#1c1917',
    secondary: '#44403c',
    tertiary: '#78716c',
    accent: '#ff5e0d'
  },
  
  // Para bordas
  border: {
    light: '#fed7aa',
    medium: '#fdba74',
    dark: '#ea580c'
  },
  
  // Para sombras
  shadow: {
    light: 'rgba(255, 94, 13, 0.1)',
    medium: 'rgba(255, 94, 13, 0.2)',
    dark: 'rgba(255, 94, 13, 0.3)'
  }
}

// Função para gerar variações de uma cor
export const generateColorVariations = (baseColor) => {
  return {
    50: lightenColor(baseColor, 0.9),
    100: lightenColor(baseColor, 0.8),
    200: lightenColor(baseColor, 0.6),
    300: lightenColor(baseColor, 0.4),
    400: lightenColor(baseColor, 0.2),
    500: baseColor,
    600: darkenColor(baseColor, 0.2),
    700: darkenColor(baseColor, 0.4),
    800: darkenColor(baseColor, 0.6),
    900: darkenColor(baseColor, 0.8)
  }
}

// Funções auxiliares para manipulação de cores
const lightenColor = (color, amount) => {
  // Implementação simplificada - em produção usar uma biblioteca como chroma-js
  return color
}

const darkenColor = (color, amount) => {
  // Implementação simplificada - em produção usar uma biblioteca como chroma-js
  return color
}

