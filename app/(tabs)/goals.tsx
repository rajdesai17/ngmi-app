import React, { useEffect, useMemo, useState } from 'react'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native'
import { supabase, type GoalRow } from '../../src/lib/supabase'
import { useAuth } from '../../src/features/auth/AuthContext'

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
    <LinearGradient colors={["#0b0b10", "#101828"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={styles.title}>Set your goal</Text>
          <BlurView intensity={30} tint="dark" style={styles.inputCard}>
            <TextInput
              placeholder="What’s your goal?"
              placeholderTextColor="#94a3b8"
              value={goal}
              onChangeText={setGoal}
              style={styles.input}
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
              style={styles.cta}
            >
              <Text style={{ color: '#0b0b10', fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </BlurView>

          <Text style={styles.subtitle}>Your goals</Text>
          <View style={{ gap: 10 }}>
            {rows.map((r) => {
              const created = new Date(r.created_at)
              const sinceHours = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60))
              return (
                <BlurView key={r.id} intensity={25} tint="dark" style={styles.goalCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>{r.goal}</Text>
                    <Text style={{ color: '#94a3b8', marginTop: 4, fontSize: 12 }}>
                      Status: {r.status} • {sinceHours}h since set
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
                      style={[styles.cta, { backgroundColor: '#22c55e' }]}
                    >
                      <Text style={{ color: '#0b0b10', fontWeight: '700' }}>Complete</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={{ color: '#a3e635', fontWeight: '700' }}>Done</Text>
                  )}
                </BlurView>
              )
            })}
            {rows.length === 0 && <Text style={{ color: '#94a3b8' }}>No goals yet.</Text>}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  title: { color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 12 },
  subtitle: { color: 'white', fontSize: 16, fontWeight: '700', marginVertical: 12 },
  inputCard: { borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#334155', gap: 10 },
  input: { color: 'white', fontSize: 16 },
  cta: { alignSelf: 'flex-start', backgroundColor: '#a3e635', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  goalCard: { borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' },
})


