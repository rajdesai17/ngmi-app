import React from 'react'
import { Tabs } from 'expo-router'
import { View } from 'react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 20,
          height: 64,
          borderRadius: 16,
          backgroundColor: '#0f172aEE',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#a3e635',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 8 },
        tabBarIconStyle: { marginTop: 10 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  )
}


