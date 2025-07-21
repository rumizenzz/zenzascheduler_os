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
    return await supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp(email: string, password: string, displayName: string, relationshipRole?: string) {
    const res = await fetch('/.netlify/functions/send-confirmation-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, relationshipRole })
    })

    let data: any
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      const text = await res.text()
      throw new Error(text || 'Invalid response from server')
    }

    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign up')
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