import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Switch, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useAuth } from '../../src/features/auth/AuthContext'
import { scheduleTestNotification } from '../../src/features/notifications/setup'

export default function SettingsScreen() {
  const { session, signInWithPassword, signUpWithPassword, signOut } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [enabled, setEnabled] = React.useState(true)
  const [intensity, setIntensity] = React.useState<'mild' | 'medium' | 'spicy' | 'nuclear'>('medium')

  return (
    <LinearGradient colors={["#0b0b10", "#101828"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.title}>Settings</Text>

          <BlurView intensity={25} tint="dark" style={styles.row}>
            <Text style={styles.label}>Enable notifications</Text>
            <Switch value={enabled} onValueChange={setEnabled} />
          </BlurView>

          <BlurView intensity={25} tint="dark" style={styles.card}>
            <Text style={styles.label}>Roast intensity</Text>
            <Text style={styles.value}>{intensity}</Text>
          </BlurView>

          {session && (
            <BlurView intensity={25} tint="dark" style={styles.card}>
              <Text style={styles.label}>Test Notifications</Text>
              <TouchableOpacity 
                onPress={async () => {
                  try {
                    await scheduleTestNotification()
                    Alert.alert('Success', 'Test notification scheduled for 5 seconds!')
                  } catch (error) {
                    Alert.alert('Error', 'Failed to schedule notification')
                  }
                }}
                style={[styles.btnSecondary, { alignSelf: 'flex-start', marginTop: 8 }]}
              >
                <Text style={styles.btnText}>Send Test Roast</Text>
              </TouchableOpacity>
            </BlurView>
          )}

          <Text style={styles.title}>Account</Text>
          {!session ? (
            <BlurView intensity={25} tint="dark" style={[styles.card, { gap: 8 }] }>
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
              <View style={{ flexDirection:'row', gap: 8 }}>
                <TouchableOpacity onPress={async () => { try { await signInWithPassword(email.trim(), password); } catch (e) { console.warn(e); } }} style={styles.btnPrimary}>
                  <Text style={styles.btnText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => { try { await signUpWithPassword(email.trim(), password); } catch (e) { console.warn(e); } }} style={styles.btnSecondary}>
                  <Text style={styles.btnText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          ) : (
            <BlurView intensity={25} tint="dark" style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }] }>
              <Text style={styles.label}>{session.user.email}</Text>
              <TouchableOpacity onPress={signOut} style={styles.btnSecondary}>
                <Text style={styles.btnText}>Sign Out</Text>
              </TouchableOpacity>
            </BlurView>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  title: { color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 12 },
  card: { borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' },
  label: { color: 'white', fontWeight: '600' },
  value: { color: '#a3e635', marginTop: 6 },
  input: { color: 'white', fontSize: 16, borderWidth: 1, borderColor: '#334155', borderRadius: 10, padding: 10 },
  btnPrimary: { backgroundColor: '#a3e635', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnSecondary: { backgroundColor: '#22c55e', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnText: { color: '#0b0b10', fontWeight: '700' },
})


