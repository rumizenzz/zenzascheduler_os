import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, getCurrentUser, getUserProfile, User } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, displayName: string, relationshipRole?: string) => Promise<any>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount (one-time check)
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          const userProfile = await getUserProfile(currentUser.id)
          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    // Set up auth listener - KEEP SIMPLE, avoid any async operations in callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // NEVER use any async operations in callback - this can cause deadlocks
        setUser(session?.user || null)
        
        if (session?.user) {
          // Load profile in a separate async function outside the callback
          loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(userId: string) {
    try {
      const userProfile = await getUserProfile(userId)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  async function refreshProfile() {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  // Auth methods
  async function signIn(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (!result.error && result.data?.user) {
      const userId = result.data.user.id
      const { data: existing } = await supabase
        .from('users')
        .select('last_login')
        .eq('id', userId)
        .maybeSingle()

      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      return { ...result, previousLogin: existing?.last_login as string | null }
    }
    return result
  }

  async function signUp(email: string, password: string, displayName: string, relationshipRole?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.protocol}//${window.location.host}/confirmed`
      }
    })

    if (error) {
      throw error
    }

    // Create user profile if signup was successful
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          display_name: displayName,
          relationship_role: relationshipRole || 'individual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('Error creating user profile:', profileError)
      }

      // Send custom confirmation email via Netlify function
      try {
        await fetch('/.netlify/functions/send-confirmation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, displayName })
        })
      } catch (e) {
        console.error('Custom email error', e)
      }
    }

    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}