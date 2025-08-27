/**
 * Color palette constants for the mobile UI revamp
 * Based on the design system requirements for gradients and theme colors
 */

// Primary Gradients for each screen
export const GRADIENTS = {
  // Home Screen: Purple to Pink
  home: ['#8B5CF6', '#EC4899'],
  // Stats Screen: Blue to Cyan  
  stats: ['#3B82F6', '#06B6D4'],
  // Profile Screen: Green to Teal
  profile: ['#10B981', '#14B8A6'],
} as const

// Accent Colors
export const COLORS = {
  // Success (Goal completion)
  success: '#22C55E',
  // Warning (Medium roast intensity)
  warning: '#F59E0B',
  // Danger (High roast intensity)
  danger: '#EF4444',
  // Info (General information)
  info: '#3B82F6',
  
  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB',
    muted: '#9CA3AF',
    accent: '#A3E635',
  },
  
  // Card and UI element colors
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
} as const

// Roast intensity colors
export const ROAST_INTENSITY_COLORS = {
  mild: COLORS.success,
  medium: COLORS.warning,
  spicy: COLORS.danger,
  nuclear: '#DC2626', // Darker red for nuclear
} as const

export type GradientKey = keyof typeof GRADIENTS
export type RoastIntensity = keyof typeof ROAST_INTENSITY_COLORS