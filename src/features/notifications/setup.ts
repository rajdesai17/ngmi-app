import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'

// Set up notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export function setupNotificationListeners() {
  // Listen for notifications while app is running
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received!', notification.request.content.title)
    const payload = notification.request.content
    // Persist roast into Supabase if payload includes roast text
    const user = supabase.auth.getUser()
    user.then(({ data }) => {
      const uid = data.user?.id
      if (!uid) return
      const roastText = String(payload.body ?? payload.title ?? '')
      if (!roastText) return
      supabase
        .from('roast_history')
        .insert({
          user_id: uid,
          roast_text: roastText,
          intensity: (payload.data as any)?.intensity ?? 'medium',
          delivered_at: new Date().toISOString(),
          goal_context: (payload.data as any)?.goal ?? null,
        })
        .then(() => {})
    })
  })

  // Listen for when user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped!', response.notification.request.content)
    // Handle deep linking or navigation here if needed
  })

  return () => {
    receivedSubscription.remove()
    responseSubscription.remove()
  }
}

// Schedule a local test notification
export async function scheduleTestNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "NGMI Reminder 🔥",
        body: "Still working on your goal? Time to take action!",
        data: { type: 'roast', intensity: 'medium' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5, // 5 seconds from now
      },
    })
    console.log('Test notification scheduled')
  } catch (error) {
    console.warn('Failed to schedule test notification:', error)
  }
}
