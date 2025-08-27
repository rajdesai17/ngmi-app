import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { supabase, type RoastRow } from '../../src/lib/supabase'
import { useAuth } from '../../src/features/auth/AuthContext'
import { ScreenContainer, Card, COLORS, ROAST_INTENSITY_COLORS } from '../../src/components/ui'

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

  function getTimeAgo(delivered: string): string {
    const now = Date.now()
    const deliveredTime = new Date(delivered).getTime()
    const diffHours = Math.floor((now - deliveredTime) / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    return 'Just now'
  }

  function getIntensityEmoji(intensity: string): string {
    switch (intensity) {
      case 'mild': return '😊'
      case 'medium': return '🔥'
      case 'spicy': return '🌶️'
      case 'nuclear': return '☢️'
      default: return '🤖'
    }
  }

  if (loading) {
    return (
      <ScreenContainer gradient="stats">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.text.accent} />
          <Text style={{ color: COLORS.text.secondary, marginTop: 12 }}>
            Loading roast history...
          </Text>
        </View>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer gradient="stats">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📜 Roast History</Text>
        
        {!session && (
          <Card variant="primary" blur={true} style={{ marginBottom: 20 }}>
            <Text style={styles.emptyTitle}>🔐 Sign In Required</Text>
            <Text style={styles.emptyText}>
              Sign in to see your complete roast history and track your motivation journey.
            </Text>
          </Card>
        )}

        <View style={{ gap: 12 }}>
          {roasts.length === 0 && session ? (
            <Card variant="primary" blur={true}>
              <Text style={styles.emptyTitle}>🌟 No Roasts Yet!</Text>
              <Text style={styles.emptyText}>
                Set a goal to start receiving savage motivation. Your roast history will appear here.
              </Text>
            </Card>
          ) : (
            roasts.map((roast, idx) => (
              <Card key={roast.id} variant="secondary" blur={true}>
                <View style={styles.roastHeader}>
                  <View style={styles.roastInfo}>
                    <Text style={styles.roastNumber}>
                      🔥 Roast #{roasts.length - idx}
                    </Text>
                    <View 
                      style={[
                        styles.intensityBadge, 
                        { backgroundColor: ROAST_INTENSITY_COLORS[roast.intensity as keyof typeof ROAST_INTENSITY_COLORS] || COLORS.text.muted }
                      ]}
                    >
                      <Text style={styles.intensityText}>
                        {getIntensityEmoji(roast.intensity)} {roast.intensity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.timeAgo}>{getTimeAgo(roast.delivered_at)}</Text>
                </View>
                
                <Text style={styles.roastText}>{roast.roast_text}</Text>
                
                {roast.goal_context && (
                  <View style={styles.goalContextContainer}>
                    <Text style={styles.goalContextLabel}>🎯 Goal:</Text>
                    <Text style={styles.goalContextText}>{roast.goal_context}</Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>
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
  emptyTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: { 
    color: COLORS.text.secondary, 
    textAlign: 'center', 
    fontSize: 14,
    lineHeight: 20,
  },
  roastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roastInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roastNumber: { 
    color: COLORS.text.primary, 
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  intensityBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
  },
  intensityText: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: '700',
  },
  timeAgo: { 
    color: COLORS.text.muted, 
    fontSize: 12,
    fontWeight: '500',
  },
  roastText: { 
    color: COLORS.text.secondary, 
    fontSize: 16, 
    lineHeight: 24,
    marginBottom: 8,
  },
  goalContextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  goalContextLabel: { 
    color: COLORS.text.accent, 
    fontSize: 12, 
    fontWeight: '600',
    marginBottom: 4,
  },
  goalContextText: { 
    color: COLORS.text.muted, 
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
})