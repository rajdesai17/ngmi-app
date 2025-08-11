import React, { useMemo, useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import HomeScreen from './app/(tabs)/home'
import GoalsScreen from './app/(tabs)/goals'
import HistoryScreen from './app/(tabs)/history'
import SettingsScreen from './app/(tabs)/settings'
import { AuthProvider } from './src/features/auth/AuthContext'
import { setupNotificationListeners } from './src/features/notifications/setup'

type TabKey = 'home' | 'goals' | 'history' | 'settings'

export default function App() {
  const [tab, setTab] = useState<TabKey>('home')

  // Set up notification listeners
  useEffect(() => {
    const cleanup = setupNotificationListeners()
    return cleanup
  }, [])

  const Screen = useMemo(() => {
    switch (tab) {
      case 'goals':
        return <GoalsScreen />
      case 'history':
        return <HistoryScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <HomeScreen />
    }
  }, [tab])

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        {Screen}
        <View style={styles.tabWrap}>
          <BlurView intensity={30} tint="dark" style={styles.tabBar}>
            {(
              [
                { key: 'home', label: 'Home' },
                { key: 'goals', label: 'Goals' },
                { key: 'history', label: 'History' },
                { key: 'settings', label: 'Settings' },
              ] as { key: TabKey; label: string }[]
            ).map((t) => (
              <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={styles.tabBtn}>
                <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </BlurView>
        </View>
      </View>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  tabWrap: { position: 'absolute', left: 16, right: 16, bottom: 20 },
  tabBar: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172aEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  tabBtn: { padding: 8 },
  tabText: { color: '#94a3b8', fontWeight: '600' },
  tabTextActive: { color: '#a3e635' },
})
