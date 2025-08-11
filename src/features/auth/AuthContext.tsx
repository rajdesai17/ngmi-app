import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { registerDevicePushToken } from '../notifications/push'

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']

type AuthContextType = {
  session: Session
  loading: boolean
  signInWithOtp: (email: string) => Promise<void>
  signUpWithPassword: (email: string, password: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      // Register device token when user is authenticated
      if (data.session?.user?.id) {
        registerDevicePushToken(data.session.user.id)
      }
    })

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s)
      setLoading(false)
      
      // Register device token on sign in
      if (event === 'SIGNED_IN' && s?.user?.id) {
        await registerDevicePushToken(s.user.id)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function signInWithOtp(email: string) {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'https://localhost' } })
    if (error) throw error
  }

  async function signUpWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ session, loading, signInWithOtp, signUpWithPassword, signInWithPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


