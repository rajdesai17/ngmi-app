import React from 'react'
import { ScrollView, StyleSheet, Text, View, Switch, TouchableOpacity, Alert } from 'react-native'
import { useAuth } from '../../src/features/auth/AuthContext'
import { scheduleTestNotification } from '../../src/features/notifications/setup'
import { ScreenContainer, Card, COLORS } from '../../src/components/ui'

export default function SettingsScreen() {
  const { session, signOut } = useAuth()
  const [enabled, setEnabled] = React.useState(true)
  const [intensity, setIntensity] = React.useState<'mild' | 'medium' | 'spicy' | 'nuclear'>('medium')

  const intensityColors = {
    mild: COLORS.success,
    medium: COLORS.warning,
    spicy: COLORS.danger,
    nuclear: '#DC2626'
  }

  return (
    <ScreenContainer gradient="stats">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>⚙️ Settings</Text>

        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        
        <Card variant="primary" blur={true} style={{ marginBottom: 16 }}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive savage roasts to keep you motivated
              </Text>
            </View>
            <Switch 
              value={enabled} 
              onValueChange={setEnabled}
              trackColor={{ false: COLORS.text.muted, true: COLORS.success }}
              thumbColor={enabled ? 'white' : '#f4f3f4'}
            />
          </View>
        </Card>

        <Card variant="secondary" blur={true} style={{ marginBottom: 16 }}>
          <Text style={styles.settingLabel}>Roast Intensity</Text>
          <Text style={styles.settingDescription}>How savage should we be?</Text>
          <View style={styles.intensityContainer}>
            {(['mild', 'medium', 'spicy', 'nuclear'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setIntensity(level)}
                style={[
                  styles.intensityButton,
                  { 
                    backgroundColor: intensity === level ? intensityColors[level] : 'transparent',
                    borderColor: intensityColors[level],
                  }
                ]}
              >
                <Text style={[
                  styles.intensityText,
                  { color: intensity === level ? 'white' : intensityColors[level] }
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {session && (
          <Card variant="accent" blur={true} style={{ marginBottom: 24 }}>
            <Text style={styles.settingLabel}>🧪 Test Notifications</Text>
            <Text style={styles.settingDescription}>
              Send yourself a test roast to make sure everything works
            </Text>
            <TouchableOpacity 
              onPress={async () => {
                try {
                  await scheduleTestNotification()
                  Alert.alert('🔥 Success!', 'Test notification scheduled for 5 seconds!')
                } catch (error) {
                  Alert.alert('❌ Error', 'Failed to schedule notification')
                }
              }}
              style={styles.testButton}
            >
              <Text style={styles.testButtonText}>Send Test Roast 🚀</Text>
            </TouchableOpacity>
          </Card>
        )}

        <Text style={styles.sectionTitle}>👤 Account</Text>
        
        {session ? (
          <Card variant="primary" blur={true}>
            <View style={styles.accountInfo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName}>
                  {(session.user.user_metadata as any)?.name ?? 'User'}
                </Text>
                <Text style={styles.accountEmail}>
                  {session.user.email}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert(
                    'Sign Out',
                    'Are you sure you want to sign out?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Sign Out', style: 'destructive', onPress: signOut }
                    ]
                  )
                }}
                style={styles.signOutButton}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card variant="primary" blur={true}>
            <Text style={styles.signInPrompt}>🔐 Sign in to access your account</Text>
            <Text style={styles.signInDescription}>
              Sign in to save your goals and receive personalized roasts
            </Text>
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  title: { 
    color: COLORS.text.primary, 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: COLORS.text.primary,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 18,
  },
  intensityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  intensityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  intensityText: {
    fontWeight: '600',
    fontSize: 14,
  },
  testButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  accountName: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  accountEmail: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  signOutButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  signOutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  signInPrompt: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  signInDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})