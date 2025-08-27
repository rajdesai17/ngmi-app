import React from 'react'
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { GRADIENTS, GradientKey } from './colors'

interface ScreenContainerProps {
  children: React.ReactNode
  gradient: GradientKey
  showHeader?: boolean
  headerTitle?: string
  style?: ViewStyle
}

export default function ScreenContainer({ 
  children, 
  gradient, 
  showHeader = false, 
  headerTitle,
  style 
}: ScreenContainerProps) {
  const gradientColors = GRADIENTS[gradient]

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        {showHeader && headerTitle && (
          <View style={styles.header}>
            {/* Header implementation can be added later if needed */}
          </View>
        )}
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    // Header styles can be expanded later
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
})