import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { supabase, type RoastRow } from '../../src/lib/supabase'
import { useAuth } from '../../src/features/auth/AuthContext'

export default function HistoryScreen() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [roasts, setRoasts] = useState<RoastRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadRoasts() {
      if (!userId) {
        setRoasts([])
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('roast_history')
          .select('*')
          .eq('user_id', userId)
          .order('delivered_at', { ascending: false })
          .limit(50)

        if (!isMounted) return
        
        if (error) {
          console.warn('Error loading roasts:', error)
          setRoasts([])
        } else {
          setRoasts((data as RoastRow[]) ?? [])
        }
      } catch (err) {
        console.warn('Failed to load roasts:', err)
        if (isMounted) setRoasts([])
      }
      
      if (isMounted) setLoading(false)
    }

    loadRoasts()
    return () => { isMounted = false }
  }, [userId])

  // removed mock roasts

  function getTimeAgo(delivered: string): string {
    const now = Date.now()
    const deliveredTime = new Date(delivered).getTime()
    const diffHours = Math.floor((now - deliveredTime) / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }

  function getIntensityColor(intensity: string): string {
    switch (intensity) {
      case 'mild': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'spicy': return '#ef4444'
      case 'nuclear': return '#dc2626'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={["#0b0b10", "#12121a"]} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#a3e635" />
          <Text style={{ color: '#94a3b8', marginTop: 12 }}>Loading roast history...</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#0b0b10", "#12121a"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.title}>Roast History</Text>
          
          {!session && (
            <BlurView intensity={25} tint="dark" style={[styles.item, { marginBottom: 16 }]}>
              <Text style={styles.emptyText}>Sign in to see your roast history</Text>
            </BlurView>
          )}

          <View style={{ gap: 10 }}>
            {roasts.length === 0 && session ? (
              <BlurView intensity={25} tint="dark" style={styles.item}>
                <Text style={styles.emptyText}>No roasts yet. Set a goal to get roasted!</Text>
              </BlurView>
            ) : (
              roasts.map((roast, idx) => (
                <BlurView key={roast.id} intensity={25} tint="dark" style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={styles.itemTitle}>Roast #{roasts.length - idx}</Text>
                      <View 
                        style={[
                          styles.intensityBadge, 
                          { backgroundColor: getIntensityColor(roast.intensity) }
                        ]}
                      >
                        <Text style={styles.intensityText}>{roast.intensity}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemBody}>{roast.roast_text}</Text>
                    {roast.goal_context && (
                      <Text style={styles.goalContext}>Re: {roast.goal_context}</Text>
                    )}
                  </View>
                  <Text style={styles.time}>{getTimeAgo(roast.delivered_at)}</Text>
                </BlurView>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  title: { color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' },
  itemTitle: { color: 'white', fontWeight: '600', marginRight: 8 },
  itemBody: { color: '#94a3b8', marginTop: 2, fontSize: 14, lineHeight: 20 },
  goalContext: { color: '#6b7280', marginTop: 4, fontSize: 12, fontStyle: 'italic' },
  time: { color: '#a3e635', fontWeight: '700', marginLeft: 8, fontSize: 12 },
  emptyText: { color: '#94a3b8', textAlign: 'center', fontSize: 14 },
  intensityBadge: { 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4, 
    marginLeft: 8 
  },
  intensityText: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: '600',
    textTransform: 'uppercase'
  },
})


