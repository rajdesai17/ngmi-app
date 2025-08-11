import React, { useEffect, useState } from 'react'
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  if (!Device.isDevice) return null

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return null

  try {
    const projectId = (Constants as any)?.expoConfig?.extra?.eas?.projectId || (Constants as any)?.easConfig?.projectId
    if (!projectId) throw new Error('Missing EAS projectId')
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
    return token
  } catch (e) {
    console.warn('Failed to get Expo push token', e)
    return null
  }
}

export default function Index() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null)

  useEffect(() => {
    registerForPushNotificationsAsync().then(setExpoPushToken)

    const subReceived = Notifications.addNotificationReceivedListener((n) => setLastNotification(n))
    const subResponse = Notifications.addNotificationResponseReceivedListener((r) => {
      console.log('Notification response', r)
    })
    return () => {
      subReceived.remove()
      subResponse.remove()
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NGMI App</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Expo Push Token</Text>
          <Text selectable style={styles.mono}>
            {expoPushToken ?? 'Requesting…'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Last Notification</Text>
          <Text style={styles.body}>Title: {lastNotification?.request.content.title ?? '-'}</Text>
          <Text style={styles.body}>Body: {lastNotification?.request.content.body ?? '-'}</Text>
          <Text style={styles.body}>Data: {JSON.stringify(lastNotification?.request.content.data ?? {})}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b10' },
  content: { padding: 16 },
  title: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: '#12121a', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1f2937' },
  label: { color: '#93c5fd', fontWeight: '600', marginBottom: 6 },
  mono: { color: '#e5e7eb', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }), fontSize: 12 },
  body: { color: '#e5e7eb', fontSize: 12 },
})


