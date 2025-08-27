import React from 'react'
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  ViewStyle, 
  TouchableOpacityProps 
} from 'react-native'
import { BlurView } from 'expo-blur'
import { COLORS } from './colors'

interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  blur?: boolean
  onPress?: () => void
  style?: ViewStyle
}

export default function Card({ 
  children, 
  variant = 'primary', 
  blur = true, 
  onPress, 
  style,
  ...touchableProps 
}: CardProps) {
  const cardStyle = [
    styles.card,
    styles[variant],
    style,
  ]

  const content = (
    <View style={styles.cardContent}>
      {children}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        activeOpacity={0.8}
        {...touchableProps}
      >
        {blur ? (
          <BlurView intensity={20} tint="light" style={styles.blurContainer}>
            {content}
          </BlurView>
        ) : (
          content
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={cardStyle}>
      {blur ? (
        <BlurView intensity={20} tint="light" style={styles.blurContainer}>
          {content}
        </BlurView>
      ) : (
        content
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  primary: {
    backgroundColor: COLORS.card.background,
    borderWidth: 1,
    borderColor: COLORS.card.border,
    shadowColor: COLORS.card.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  accent: {
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(163, 230, 53, 0.3)',
  },
  blurContainer: {
    flex: 1,
  },
  cardContent: {
    padding: 16,
  },
})