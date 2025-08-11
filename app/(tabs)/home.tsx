import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image } from 'react-native'
import { useAuth } from '../../src/features/auth/AuthContext'
import { supabase, type GoalRow, type RoastRow } from '../../src/lib/supabase'

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
          .eq('user_id', user.id)

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
          .eq('user_id', user.id)
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
      <LinearGradient colors={["#0b0b10", "#1a1030"]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>Loading...</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }
  return (
    <LinearGradient colors={["#0b0b10", "#1a1030"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.headerRow}>
            <Image source={{ uri: 'https://i.pravatar.cc/64' }} style={styles.avatar} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.greet}>Hi{user ? ',' : ''} {user?.email ?? 'Guest'}</Text>
              <Text style={styles.subtle}>Curated & trending</Text>
            </View>
          </View>

          {!user && (
            <BlurView intensity={40} tint="dark" style={styles.heroCard}>
              <View style={styles.heroInner}>
                <Text style={styles.heroTitle}>Sign in</Text>
                <Text style={styles.heroBody}>Go to Settings to sign in and start tracking your goals</Text>
              </View>
            </BlurView>
          )}

          {user && currentGoal && (
            <BlurView intensity={40} tint="dark" style={styles.heroCard}>
              <View style={styles.heroInner}>
                <Text style={styles.heroTitle}>Current Goal</Text>
                <Text style={styles.heroBody}>{currentGoal.goal}</Text>
                <Text style={styles.heroMeta}>
                  Set {Math.floor((Date.now() - new Date(currentGoal.created_at).getTime()) / (1000 * 60 * 60))}h ago
                </Text>
              </View>
            </BlurView>
          )}

          {user && !currentGoal && (
            <BlurView intensity={40} tint="dark" style={styles.heroCard}>
              <View style={styles.heroInner}>
                <Text style={styles.heroTitle}>No Active Goal</Text>
                <Text style={styles.heroBody}>Set a goal to get started with savage motivation</Text>
              </View>
            </BlurView>
          )}

          {user && (
            <>
              <Text style={styles.sectionTitle}>Your Progress</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <BlurView intensity={30} tint="dark" style={[styles.statCard, { flex: 1 }]}>
                  <Text style={styles.statNumber}>{stats.totalGoals}</Text>
                  <Text style={styles.statLabel}>Total Goals</Text>
                </BlurView>
                <BlurView intensity={30} tint="dark" style={[styles.statCard, { flex: 1 }]}>
                  <Text style={styles.statNumber}>{getCompletionRate()}%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </BlurView>
                <BlurView intensity={30} tint="dark" style={[styles.statCard, { flex: 1 }]}>
                  <Text style={styles.statNumber}>{stats.totalRoasts}</Text>
                  <Text style={styles.statLabel}>Roasts Received</Text>
                </BlurView>
              </View>

              <BlurView intensity={30} tint="dark" style={styles.listCard}>
                <Text style={styles.cardTitle}>Roast Status</Text>
                <Text style={styles.cardMeta}>{getTimeSinceLastRoast()}</Text>
              </BlurView>
            </>
          )}

          {!user && (
            <>
              <Text style={styles.sectionTitle}>Why NGMI?</Text>
              <View style={{ gap: 12 }}>
                <BlurView intensity={30} tint="dark" style={styles.listCard}>
                  <Text style={styles.cardTitle}>Brutal Accountability</Text>
                  <Text style={styles.cardMeta}>No mercy, no participation trophies</Text>
                </BlurView>
                <BlurView intensity={30} tint="dark" style={styles.listCard}>
                  <Text style={styles.cardTitle}>AI-Powered Roasts</Text>
                  <Text style={styles.cardMeta}>Personalized motivation based on your goals</Text>
                </BlurView>
                <BlurView intensity={30} tint="dark" style={styles.listCard}>
                  <Text style={styles.cardTitle}>Push Notifications</Text>
                  <Text style={styles.cardMeta}>Daily reminders until you succeed</Text>
                </BlurView>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  greet: { color: 'white', fontSize: 24, fontWeight: '700' },
  subtle: { color: '#94a3b8' },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  heroInner: { padding: 16 },
  heroTitle: { color: '#a3e635', fontWeight: '700', fontSize: 18, marginBottom: 6 },
  heroBody: { color: '#e5e7eb', fontSize: 16, lineHeight: 22 },
  heroMeta: { color: '#94a3b8', fontSize: 12, marginTop: 6 },
  sectionTitle: { color: 'white', fontWeight: '700', fontSize: 18, marginVertical: 12 },
  listCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
  },
  cardTitle: { color: 'white', fontWeight: '600', fontSize: 16 },
  cardMeta: { color: '#94a3b8', marginTop: 4, fontSize: 12 },
  statCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    alignItems: 'center',
  },
  statNumber: { color: '#a3e635', fontSize: 24, fontWeight: '700' },
  statLabel: { color: '#94a3b8', fontSize: 12, marginTop: 4, textAlign: 'center' },
})


