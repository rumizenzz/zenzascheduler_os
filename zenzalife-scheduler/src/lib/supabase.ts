import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. API calls will fail.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  display_name: string
  email: string
  age?: number
  profile_photo?: string
  relationship_role?: string
  relationship_status?: string
  role_type?: string
  growth_identity?: string
  family_id?: string
  bio?: string
  created_at?: string
  updated_at?: string
}

export type Task = {
  id: string
  user_id: string
  title: string
  category?: string
  start_time?: string
  end_time?: string
  repeat_pattern?: string
  alarm?: boolean
  custom_sound_path?: string
  goal_linked?: string
  completed?: boolean
  visibility?: string
  assigned_to?: string
  created_at?: string
  updated_at?: string
}

export type FamilyGroup = {
  id: string
  family_name: string
  created_by: string
  planned_children?: number
  current_children?: number
  children_profiles?: any
  milestones?: any
  created_at?: string
  updated_at?: string
}

export type Affirmation = {
  id: string
  user_id: string
  date: string
  content: string
  type?: string
  shared_with?: any
  is_favorite?: boolean
  completed?: boolean
  created_at?: string
  updated_at?: string
}

export type GrowthLog = {
  id: string
  user_id: string
  date: string
  score_1percent?: number
  identity_tags?: any
  completed_tasks?: number
  missed_tasks?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

// Helper functions
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  
  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }
  
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !currentUser) {
    throw new Error('User authentication failed, please log in again')
  }

  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', currentUser.id)
    .select()
    .maybeSingle()

  if (error) {
    console.error('Database update error:', error)
    throw error
  }

  return data
}