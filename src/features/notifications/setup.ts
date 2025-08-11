import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

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
