import type { ExpoConfig } from '@expo/config'

const config: ExpoConfig = {
  name: 'NGMI App',
  slug: 'ngmi-app',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
}

export default config


