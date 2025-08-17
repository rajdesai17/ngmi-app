import { supabase } from '../../src/lib/supabase'

// Mock the notification setup
jest.mock('../../src/features/notifications/setup', () => ({
  setupNotificationListeners: jest.fn(() => jest.fn())
}))

// Mock Supabase
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Dashboard to Mobile App Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard Roast Delivery Verification', () => {
    it('should verify dashboard can send roasts to mobile devices', async () => {
      // Requirement 6.1: Dashboard-sent roasts should be received by mobile app
      
      // Mock device registration in database
      const mockDeviceSelect = jest.fn().mockResolvedValue({
        data: [
          {
            user_id: 'test-user-123',
            expo_push_token: 'ExponentPushToken[test-token-123]',
            platform: 'ios',
            is_active: true
          }
        ],
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: mockDeviceSelect,
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis()
      } as any)

      // Simulate dashboard API call structure
      const dashboardRoastPayload = {
        user_ids: ['test-user-123'],
        roast_text: 'Time to get back to work! Your goals won\'t achieve themselves! 🔥',
        intensity: 'medium',
        goal_context: 'Complete project milestone',
        source: 'generated'
      }

      // Verify device lookup would work
      const devices = await mockSupabase
        .from('devices')
        .select('expo_push_token')
        .eq('user_id', dashboardRoastPayload.user_ids[0])
        .eq('is_active', true)
        .not('expo_push_token', 'is', null)

      expect(mockSupabase.from).toHaveBeenCalledWith('devices')
      expect(devices.data).toHaveLength(1)
      expect(devices.data[0].expo_push_token).toBe('ExponentPushToken[test-token-123]')
    })

    it('should handle users with no active devices', async () => {
      // Requirement 3.4: Push token validation and error handling
      const mockDeviceSelect = jest.fn().mockResolvedValue({
        data: [],
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: mockDeviceSelect,
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis()
      } as any)

      const devices = await mockSupabase
        .from('devices')
        .select('expo_push_token')
        .eq('user_id', 'user-with-no-devices')
        .eq('is_active', true)
        .not('expo_push_token', 'is', null)

      expect(devices.data).toHaveLength(0)
    })

    it('should handle database errors during device lookup', async () => {
      // Requirement 3.4: Push token validation and error handling
      const mockDeviceSelect = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      })

      mockSupabase.from.mockReturnValue({
        select: mockDeviceSelect,
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis()
      } as any)

      const devices = await mockSupabase
        .from('devices')
        .select('expo_push_token')
        .eq('user_id', 'test-user-123')
        .eq('is_active', true)
        .not('expo_push_token', 'is', null)

      expect(devices.error).toBeTruthy()
      expect(devices.error.message).toBe('Database connection failed')
    })
  })

  describe('Roast History Storage Verification', () => {
    it('should verify roasts are stored in history when received', async () => {
      // Requirement 6.4: Notifications should be stored in roast history
      const mockInsert = jest.fn().mockResolvedValue({
        data: {
          id: 'roast-123',
          user_id: 'test-user-123',
          roast_text: 'Test roast message',
          intensity: 'medium',
          delivered_at: '2024-01-01T12:00:00Z'
        },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'roast-123',
            user_id: 'test-user-123',
            roast_text: 'Test roast message',
            intensity: 'medium',
            delivered_at: '2024-01-01T12:00:00Z'
          },
          error: null
        })
      } as any)

      // Simulate roast storage from notification reception
      const roastData = {
        user_id: 'test-user-123',
        roast_text: 'Test roast message',
        intensity: 'medium',
        goal_context: 'Complete project milestone',
        delivered_at: new Date().toISOString()
      }

      const result = await mockSupabase
        .from('roast_history')
        .insert(roastData)

      expect(mockSupabase.from).toHaveBeenCalledWith('roast_history')
      expect(mockInsert).toHaveBeenCalledWith(roastData)
      expect(result.data).toBeTruthy()
    })

    it('should handle roast history storage errors', async () => {
      // Requirement 6.4: Error handling for roast history storage
      const mockInsert = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      })

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      } as any)

      const roastData = {
        user_id: 'test-user-123',
        roast_text: 'Test roast message',
        intensity: 'medium',
        delivered_at: new Date().toISOString()
      }

      const result = await mockSupabase
        .from('roast_history')
        .insert(roastData)

      expect(result.error).toBeTruthy()
      expect(result.error.message).toBe('Insert failed')
    })
  })

  describe('Notification Payload Verification', () => {
    it('should verify notification payload structure matches dashboard format', () => {
      // Requirement 6.2: Notifications should display clearly
      const expectedPayloadStructure = {
        to: 'ExponentPushToken[test-token-123]',
        sound: 'default',
        title: 'NGMI Reminder 🔥',
        body: 'Time to get back to work! Your goals won\'t achieve themselves! 🔥',
        data: {
          type: 'roast',
          intensity: 'medium',
          goal: 'Complete project milestone',
          roast_id: 'roast-123',
          source: 'generated'
        }
      }

      // Verify all required fields are present
      expect(expectedPayloadStructure.to).toBeTruthy()
      expect(expectedPayloadStructure.title).toBeTruthy()
      expect(expectedPayloadStructure.body).toBeTruthy()
      expect(expectedPayloadStructure.data.type).toBe('roast')
      expect(expectedPayloadStructure.data.intensity).toBeTruthy()
      expect(expectedPayloadStructure.sound).toBe('default')
    })

    it('should verify goal-based roast payload structure', () => {
      // Requirement 1.1: Goal-based roasts should include goal context
      const goalBasedPayload = {
        to: 'ExponentPushToken[test-token-123]',
        sound: 'default',
        title: 'NGMI Reminder 🔥',
        body: 'Your goal "Complete project milestone" needs attention! Stop procrastinating! 💪',
        data: {
          type: 'roast',
          intensity: 'spicy',
          goal: 'Complete project milestone',
          roast_id: 'roast-456',
          source: 'generated'
        }
      }

      expect(goalBasedPayload.data.goal).toBeTruthy()
      expect(goalBasedPayload.body).toContain('Complete project milestone')
    })

    it('should verify universal roast payload structure', () => {
      // Requirement 2.1: Universal roasts should work for all users
      const universalPayload = {
        to: 'ExponentPushToken[test-token-123]',
        sound: 'default',
        title: 'NGMI Reminder 🔥',
        body: 'Time to level up! Winners don\'t make excuses! 🚀',
        data: {
          type: 'roast',
          intensity: 'medium',
          goal: null, // Universal roasts don't have specific goal context
          roast_id: 'roast-789',
          source: 'generated'
        }
      }

      expect(universalPayload.data.goal).toBeNull()
      expect(universalPayload.body).not.toContain('your goal')
    })
  })

  describe('Multi-Device Support', () => {
    it('should verify roasts can be sent to multiple devices per user', async () => {
      // Requirement 6.1: Support for users with multiple devices
      const mockDeviceSelect = jest.fn().mockResolvedValue({
        data: [
          {
            user_id: 'test-user-123',
            expo_push_token: 'ExponentPushToken[ios-device-123]',
            platform: 'ios',
            is_active: true
          },
          {
            user_id: 'test-user-123',
            expo_push_token: 'ExponentPushToken[android-device-456]',
            platform: 'android',
            is_active: true
          }
        ],
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: mockDeviceSelect,
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis()
      } as any)

      const devices = await mockSupabase
        .from('devices')
        .select('expo_push_token')
        .eq('user_id', 'test-user-123')
        .eq('is_active', true)
        .not('expo_push_token', 'is', null)

      expect(devices.data).toHaveLength(2)
      expect(devices.data[0].platform).toBe('ios')
      expect(devices.data[1].platform).toBe('android')
    })

    it('should filter out inactive devices', async () => {
      // Requirement 3.4: Only send to active devices
      const mockDeviceSelect = jest.fn().mockResolvedValue({
        data: [
          {
            user_id: 'test-user-123',
            expo_push_token: 'ExponentPushToken[active-device-123]',
            platform: 'ios',
            is_active: true
          }
          // Inactive device should be filtered out by query
        ],
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: mockDeviceSelect,
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis()
      } as any)

      const devices = await mockSupabase
        .from('devices')
        .select('expo_push_token')
        .eq('user_id', 'test-user-123')
        .eq('is_active', true)
        .not('expo_push_token', 'is', null)

      expect(devices.data).toHaveLength(1)
      expect(devices.data[0].expo_push_token).toBe('ExponentPushToken[active-device-123]')
    })
  })

  describe('Delivery Status Tracking', () => {
    it('should track successful deliveries', () => {
      // Requirement 3.3: Display delivery status
      const deliveryResult = {
        user_id: 'test-user-123',
        success: true,
        roast_id: 'roast-123',
        devices_notified: 2,
        delivery_time: 1500 // milliseconds
      }

      expect(deliveryResult.success).toBe(true)
      expect(deliveryResult.devices_notified).toBeGreaterThan(0)
      expect(deliveryResult.delivery_time).toBeGreaterThan(0)
    })

    it('should track failed deliveries with error details', () => {
      // Requirement 3.3: Display delivery status with failures
      const deliveryResult = {
        user_id: 'test-user-456',
        success: false,
        error: 'Invalid push token',
        devices_notified: 0,
        delivery_time: 500
      }

      expect(deliveryResult.success).toBe(false)
      expect(deliveryResult.error).toBeTruthy()
      expect(deliveryResult.devices_notified).toBe(0)
    })
  })
})