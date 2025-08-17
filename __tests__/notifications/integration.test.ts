import * as Notifications from 'expo-notifications'
import { supabase } from '../../src/lib/supabase'
import { registerDevicePushToken } from '../../src/features/notifications/push'
import { setupNotificationListeners, scheduleTestNotification } from '../../src/features/notifications/setup'

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: 'timeInterval'
  },
  AndroidImportance: {
    MAX: 'max'
  }
}))

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true
}))

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        eas: {
          projectId: 'test-project-id'
        }
      },
      version: '1.0.0'
    }
  }
}))

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios'
  }
}))

// Mock supabase
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } }
      }))
    }
  }
}))

describe('Mobile App Notification Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Push Token Registration', () => {
    it('should register device push token successfully', async () => {
      // Mock successful permission and token retrieval
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      ;(Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[test-token]'
      })

      const mockUpsert = jest.fn(() => Promise.resolve({ data: null, error: null }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        upsert: mockUpsert
      })

      const token = await registerDevicePushToken('test-user-id')

      expect(token).toBe('ExponentPushToken[test-token]')
      expect(mockUpsert).toHaveBeenCalledWith(
        {
          user_id: 'test-user-id',
          expo_push_token: 'ExponentPushToken[test-token]',
          platform: 'ios',
          app_version: '1.0.0',
          is_active: true,
          last_seen: expect.any(String)
        },
        { onConflict: 'expo_push_token' }
      )
    })

    it('should handle permission denied gracefully', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })

      const token = await registerDevicePushToken('test-user-id')

      expect(token).toBeNull()
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Permission error'))

      const token = await registerDevicePushToken('test-user-id')

      expect(token).toBeNull()
    })

    it('should skip registration for null user ID', async () => {
      const token = await registerDevicePushToken(null)

      expect(token).toBeNull()
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled()
    })
  })

  describe('Notification Handler Setup', () => {
    it('should set up notification handler with correct configuration', () => {
      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith({
        handleNotification: expect.any(Function)
      })
    })

    it('should configure notification handler to show notifications', async () => {
      const handlerCall = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0][0]
      const result = await handlerCall.handleNotification()

      expect(result).toEqual({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false
      })
    })
  })

  describe('Notification Listeners', () => {
    it('should set up notification received listener', () => {
      const mockRemove = jest.fn()
      ;(Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemove })
      ;(Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({ remove: mockRemove })

      const cleanup = setupNotificationListeners()

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalledWith(expect.any(Function))
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledWith(expect.any(Function))

      // Test cleanup
      cleanup()
      expect(mockRemove).toHaveBeenCalledTimes(2)
    })

    it('should handle received notifications and store roast history', async () => {
      const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert
      })

      // Get the listener function
      const listenerCall = (Notifications.addNotificationReceivedListener as jest.Mock).mock.calls[0][0]

      const mockNotification = {
        request: {
          content: {
            title: 'NGMI Reminder 🔥',
            body: 'Test roast message',
            data: {
              intensity: 'medium',
              goal: 'Test goal'
            }
          }
        }
      }

      // Call the listener
      await listenerCall(mockNotification)

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        roast_text: 'Test roast message',
        intensity: 'medium',
        delivered_at: expect.any(String),
        goal_context: 'Test goal'
      })
    })

    it('should handle notification taps', () => {
      // Get the response listener function
      const responseListenerCall = (Notifications.addNotificationResponseReceivedListener as jest.Mock).mock.calls[0][0]

      const mockResponse = {
        notification: {
          request: {
            content: {
              title: 'NGMI Reminder 🔥',
              body: 'Test roast message'
            }
          }
        }
      }

      // Should not throw
      expect(() => responseListenerCall(mockResponse)).not.toThrow()
    })
  })

  describe('Test Notification Scheduling', () => {
    it('should schedule test notification successfully', async () => {
      ;(Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id')

      await scheduleTestNotification()

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "NGMI Reminder 🔥",
          body: "Still working on your goal? Time to take action!",
          data: { type: 'roast', intensity: 'medium' }
        },
        trigger: {
          type: 'timeInterval',
          seconds: 5
        }
      })
    })

    it('should handle scheduling errors gracefully', async () => {
      ;(Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(new Error('Scheduling failed'))

      // Should not throw
      await expect(scheduleTestNotification()).resolves.toBeUndefined()
    })
  })

  describe('Roast History Storage', () => {
    it('should store roast with all required fields', async () => {
      const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert
      })

      const listenerCall = (Notifications.addNotificationReceivedListener as jest.Mock).mock.calls[0][0]

      const mockNotification = {
        request: {
          content: {
            title: 'Custom Title',
            body: 'Custom roast message',
            data: {
              intensity: 'spicy',
              goal: 'Custom goal context'
            }
          }
        }
      }

      await listenerCall(mockNotification)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        roast_text: 'Custom roast message',
        intensity: 'spicy',
        delivered_at: expect.any(String),
        goal_context: 'Custom goal context'
      })
    })

    it('should handle missing notification data gracefully', async () => {
      const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert
      })

      const listenerCall = (Notifications.addNotificationReceivedListener as jest.Mock).mock.calls[0][0]

      const mockNotification = {
        request: {
          content: {
            // No title or body
            data: {}
          }
        }
      }

      await listenerCall(mockNotification)
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should not insert if no roast text
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should use title as fallback when body is missing', async () => {
      const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }))
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert
      })

      const listenerCall = (Notifications.addNotificationReceivedListener as jest.Mock).mock.calls[0][0]

      const mockNotification = {
        request: {
          content: {
            title: 'Title as roast text',
            // No body
            data: {
              intensity: 'medium'
            }
          }
        }
      }

      await listenerCall(mockNotification)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'test-user-id',
        roast_text: 'Title as roast text',
        intensity: 'medium',
        delivered_at: expect.any(String),
        goal_context: null
      })
    })
  })
})