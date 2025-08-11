import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const extra = (Constants as any)?.expoConfig?.extra || (Constants as any)?.manifestExtra || {}
const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabaseUrl) as string
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.supabaseAnonKey) as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase env missing. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set (mobile/.env).')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      async getItem(key: string) {
        return SecureStore.getItemAsync(key)
      },
      async setItem(key: string, value: string) {
        await SecureStore.setItemAsync(key, value)
      },
      async removeItem(key: string) {
        await SecureStore.deleteItemAsync(key)
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type GoalRow = {
  id: string
  user_id: string
  goal: string
  status: 'active' | 'completed'
  created_at: string
  completed_at: string | null
}

export type RoastRow = {
  id: string
  user_id: string
  roast_text: string
  intensity: 'mild' | 'medium' | 'spicy' | 'nuclear'
  delivered_at: string
  goal_context?: string
}


