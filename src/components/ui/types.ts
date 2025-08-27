/**
 * Type definitions for UI components
 */

import { ViewStyle } from 'react-native'
import { GradientKey, RoastIntensity } from './colors'

export interface ScreenContainerProps {
  children: React.ReactNode
  gradient: GradientKey
  showHeader?: boolean
  headerTitle?: string
  style?: ViewStyle
}

export interface CardProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  blur?: boolean
  onPress?: () => void
  style?: ViewStyle
}

export { GradientKey, RoastIntensity }