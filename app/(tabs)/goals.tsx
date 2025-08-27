import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native'
import { supabase, type GoalRow } from '../../src/lib/supabase'
import { useAuth } from '../../src/features/auth/AuthContext'
import { ScreenContainer, Card, COLORS } from '../../src/components/ui'

export default function GoalsScreen() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [goal, setGoal] = useState('')
  const [rows, setRows] = useState<GoalRow[]>([])

  useEffect(() => {
    let isMounted = true
    async function load() {
      if (!userId) {
        setRows([])
        return
      }
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (!isMounted) return
      if (error) console.warn(error)
      setRows((data as GoalRow[]) ?? [])
    }
    load()
    return () => { isMounted = false }
  }, [userId])

  return (
    <ScreenContainer gradient="profile">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🎯 Set Your Goal</Text>
        
        <Card variant="primary" blur={true} style={{ marginBottom: 24 }}>
          <TextInput
            placeholder="What's your goal?"
            placeholderTextColor={COLORS.text.muted}
            value={goal}
            onChangeText={setGoal}
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            onPress={() => {
              if (!goal.trim() || !userId) return
              const g = goal.trim()
              ;(async () => {
                const { data, error } = await supabase
                  .from('goals')
                  .insert({ user_id: userId, goal: g, status: 'active' })
                  .select('*')
                  .single()
                if (error) { console.warn(error); return }
                if (data) setRows((prev) => [data as GoalRow, ...prev])
                setGoal('')
              })()
            }}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>Save Goal 🚀</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.subtitle}>📋 Your Goals</Text>
        
        <View style={{ gap: 12 }}>
          {rows.map((r) => {
            const created = new Date(r.created_at)
            const sinceHours = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60))
            const sinceDays = Math.floor(sinceHours / 24)
            const timeText = sinceDays > 0 ? `${sinceDays}d ago` : `${sinceHours}h ago`
            
            return (
              <Card 
                key={r.id} 
                variant={r.status === 'completed' ? 'accent' : 'secondary'} 
                blur={true}
              >
                <View style={styles.goalContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalText}>{r.goal}</Text>
                    <Text style={styles.goalMeta}>
                      {r.status === 'completed' ? '✅ Completed' : '🔥 Active'} • {timeText}
                    </Text>
                  </View>
                  {r.status === 'active' ? (
                    <TouchableOpacity
                      onPress={async () => {
                        const { data } = await supabase
                          .from('goals')
                          .update({ status: 'completed', completed_at: new Date().toISOString() })
                          .eq('id', r.id)
                          .select('*')
                          .single()
                        if (data) setRows((prev) => prev.map((x) => (x.id === r.id ? (data as GoalRow) : x)))
                      }}
                      style={styles.completeButton}
                    >
                      <Text style={styles.completeButtonText}>Complete ✅</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>🎉 Done!</Text>
                    </View>
                  )}
                </View>
              </Card>
            )
          })}
          
          {rows.length === 0 && (
            <Card variant="primary" blur={true}>
              <Text style={styles.emptyText}>🌟 No goals yet!</Text>
              <Text style={styles.emptySubtext}>
                Set your first goal above to start your journey to success.
              </Text>
            </Card>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: { 
    color: COLORS.text.primary, 
    fontSize: 20, 
    fontWeight: '700', 
    marginVertical: 16,
  },
  input: { 
    color: COLORS.text.primary, 
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: { 
    alignSelf: 'flex-start', 
    backgroundColor: COLORS.success, 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalText: {
    color: COLORS.text.primary,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  goalMeta: {
    color: COLORS.text.muted,
    fontSize: 12,
  },
  completeButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  completedBadge: {
    backgroundColor: COLORS.success,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  completedText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: COLORS.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})