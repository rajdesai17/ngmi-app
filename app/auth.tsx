import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../src/features/auth/AuthContext'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  if (!session) return <AuthScreen />
  return <>{children}</>
}

function AuthScreen() {
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit() {
    try {
      setLoading(true)
      setError(null)
      if (mode === 'signup') {
        await signUpWithPassword(name.trim(), email.trim(), password)
      } else {
        await signInWithPassword(email.trim(), password)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={["#0b0b10", "#131321"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ padding: 16 }}>
          <Text style={styles.title}>NGMI</Text>
          <Text style={styles.subtitle}>Account</Text>

          <BlurView intensity={30} tint="dark" style={[styles.card, { gap: 10 }]}>
            {mode === 'signup' && (
              <TextInput
                placeholder="Name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            )}
            <TextInput
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
            {error && <Text style={{ color: '#ef4444' }}>{error}</Text>}
            <TouchableOpacity disabled={loading} onPress={onSubmit} style={styles.btnPrimary}>
              <Text style={styles.btnText}>{loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}</Text>
            </TouchableOpacity>
          </BlurView>

          <TouchableOpacity disabled={loading} onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
              {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  title: { color: 'white', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: '#a3e635', marginTop: 4, marginBottom: 16, fontWeight: '700' },
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#334155', padding: 16 },
  input: { color: 'white', fontSize: 16, borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 12 },
  btnPrimary: { backgroundColor: '#a3e635', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#0b0b10', fontWeight: '800' },
})


