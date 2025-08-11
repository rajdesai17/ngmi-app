import type { ExpoConfig } from '@expo/config'

const config: ExpoConfig = {
  name: 'NGMI App',
  slug: 'ngmi',
  owner: 'rajoninternet',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      // Set explicitly per EAS init instructions
      projectId: '03edafb2-194a-4bfc-8b4e-4ded5bda0d36',
    },
  },
}

export default config


