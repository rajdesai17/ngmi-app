import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import { useAuth } from '../../src/features/auth/AuthContext'
import { supabase, type GoalRow, type RoastRow } from '../../src/lib/supabase'
import { ScreenContainer, Card, COLORS } from '../../src/components/ui'

type UserStats = {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  totalRoasts: number
  lastRoastTime: string | null
}

export default function HomeScreen() {
  const { session, loading } = useAuth()
  const user = session?.user
  const [stats, setStats] = useState<UserStats>({
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    totalRoasts: 0,
    lastRoastTime: null
  })
  const [currentGoal, setCurrentGoal] = useState<GoalRow | null>(null)

  useEffect(() => {
    if (!user?.id) return

    async function loadUserStats() {
      try {
        // Load goal stats
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user!.id)

        if (goals) {
          const totalGoals = goals.length
          const completedGoals = goals.filter(g => g.status === 'completed').length
          const activeGoals = goals.filter(g => g.status === 'active').length
          const activeGoal = goals.find(g => g.status === 'active') || null

          setCurrentGoal(activeGoal)
          setStats(prev => ({
            ...prev,
            totalGoals,
            completedGoals,
            activeGoals
          }))
        }

        // Load roast stats
        const { data: roasts } = await supabase
          .from('roast_history')
          .select('delivered_at')
          .eq('user_id', user!.id)
          .order('delivered_at', { ascending: false })

        if (roasts) {
          setStats(prev => ({
            ...prev,
            totalRoasts: roasts.length,
            lastRoastTime: roasts[0]?.delivered_at || null
          }))
        }
      } catch (error) {
        console.warn('Error loading user stats:', error)
      }
    }

    loadUserStats()
  }, [user?.id])

  function getTimeSinceLastRoast(): string {
    if (!stats.lastRoastTime) return 'Never roasted'
    
    const now = Date.now()
    const lastRoast = new Date(stats.lastRoastTime).getTime()
    const diffHours = Math.floor((now - lastRoast) / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays} days since last roast`
    if (diffHours > 0) return `${diffHours} hours since last roast`
    return 'Recently roasted'
  }

  function getCompletionRate(): number {
    if (stats.totalGoals === 0) return 0
    return Math.round((stats.completedGoals / stats.totalGoals) * 100)
  }

  if (loading) {
    return (
      <ScreenContainer gradient="home">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.text.secondary }}>Loading...</Text>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer gradient="home">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Image source={{ uri: 'https://i.pravatar.cc/64' }} style={styles.avatar} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greet}>
              Hi, {(user?.user_metadata as any)?.name ?? user?.email?.split('@')[0] ?? 'there'}! 👋
            </Text>
            <Text style={styles.subtle}>Ready to crush your goals?</Text>
          </View>
        </View>

        {!user && (
          <Card variant="primary" blur={true} style={{ marginBottom: 20 }}>
            <Text style={styles.heroTitle}>Welcome to NGMI! 🔥</Text>
            <Text style={styles.heroBody}>
              Sign in to start setting goals and receiving savage motivation to achieve them.
            </Text>
          </Card>
        )}

        {user && currentGoal && (
          <Card variant="accent" blur={true} style={{ marginBottom: 20 }}>
            <Text style={styles.heroTitle}>🎯 Current Goal</Text>
            <Text style={styles.heroBody}>{currentGoal.goal}</Text>
            <Text style={styles.heroMeta}>
              Set {Math.floor((Date.now() - new Date(currentGoal.created_at).getTime()) / (1000 * 60 * 60))}h ago
            </Text>
          </Card>
        )}

        {user && !currentGoal && (
          <Card variant="primary" blur={true} style={{ marginBottom: 20 }}>
            <Text style={styles.heroTitle}>🚀 No Active Goal</Text>
            <Text style={styles.heroBody}>
              Set your first goal to get started with savage motivation! Go to the Goals tab to begin.
            </Text>
          </Card>
        )}

        {user && (
          <>
            <Text style={styles.sectionTitle}>📊 Your Progress</Text>
            <View style={styles.statsRow}>
              <Card variant="secondary" blur={false} style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalGoals}</Text>
                <Text style={styles.statLabel}>Total Goals</Text>
              </Card>
              <Card variant="secondary" blur={false} style={styles.statCard}>
                <Text style={[styles.statNumber, { color: COLORS.success }]}>
                  {getCompletionRate()}%
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </Card>
              <Card variant="secondary" blur={false} style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalRoasts}</Text>
                <Text style={styles.statLabel}>Roasts Received</Text>
              </Card>
            </View>

            <Card variant="primary" blur={true}>
              <Text style={styles.cardTitle}>🔥 Roast Status</Text>
              <Text style={styles.cardMeta}>{getTimeSinceLastRoast()}</Text>
            </Card>
          </>
        )}

        {!user && (
          <>
            <Text style={styles.sectionTitle}>🔥 Why NGMI?</Text>
            <View style={{ gap: 12 }}>
              <Card variant="primary" blur={true}>
                <Text style={styles.cardTitle}>💀 Brutal Accountability</Text>
                <Text style={styles.cardMeta}>No mercy, no participation trophies</Text>
              </Card>
              <Card variant="primary" blur={true}>
                <Text style={styles.cardTitle}>🤖 AI-Powered Roasts</Text>
                <Text style={styles.cardMeta}>Personalized motivation based on your goals</Text>
              </Card>
              <Card variant="primary" blur={true}>
                <Text style={styles.cardTitle}>📱 Push Notifications</Text>
                <Text style={styles.cardMeta}>Daily reminders until you succeed</Text>
              </Card>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24,
    paddingTop: 8,
  },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.text.primary,
  },
  greet: { 
    color: COLORS.text.primary, 
    fontSize: 24, 
    fontWeight: '700',
    marginBottom: 2,
  },
  subtle: { 
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  heroTitle: { 
    color: COLORS.text.primary, 
    fontWeight: '700', 
    fontSize: 20, 
    marginBottom: 8,
  },
  heroBody: { 
    color: COLORS.text.secondary, 
    fontSize: 16, 
    lineHeight: 24,
  },
  heroMeta: { 
    color: COLORS.text.muted, 
    fontSize: 12, 
    marginTop: 8,
  },
  sectionTitle: { 
    color: COLORS.text.primary, 
    fontWeight: '700', 
    fontSize: 20, 
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardTitle: { 
    color: COLORS.text.primary, 
    fontWeight: '600', 
    fontSize: 18,
    marginBottom: 4,
  },
  cardMeta: { 
    color: COLORS.text.secondary, 
    fontSize: 14,
    lineHeight: 20,
  },
  statNumber: { 
    color: COLORS.text.accent, 
    fontSize: 28, 
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: { 
    color: COLORS.text.muted, 
    fontSize: 12, 
    textAlign: 'center',
    fontWeight: '500',
  },
})


