import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from '../../lib/supabase'

export async function registerDevicePushToken(userId: string | undefined | null) {
  try {
    if (!userId) return null

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      })
    }

    if (!Device.isDevice) return null

    const perms = await Notifications.getPermissionsAsync()
    let status = perms.status
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync()
      status = req.status
    }
    if (status !== 'granted') return null

    const projectId = (Constants as any)?.expoConfig?.extra?.eas?.projectId || (Constants as any)?.easConfig?.projectId
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data

    const platform: 'android' | 'ios' = Platform.OS === 'ios' ? 'ios' : 'android'
    const appVersion = (Constants as any)?.expoConfig?.version ?? '1.0.0'

    await supabase
      .from('devices')
      .upsert({ user_id: userId, expo_push_token: token, platform, app_version: appVersion, is_active: true, last_seen: new Date().toISOString() }, { onConflict: 'expo_push_token' })

    return token
  } catch (e) {
    console.warn('registerDevicePushToken error', e)
    return null
  }
}


