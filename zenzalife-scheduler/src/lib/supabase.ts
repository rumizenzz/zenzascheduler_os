import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  const message =
    'Supabase environment variables are not set. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  console.error(message)
  throw new Error(message)
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
  notes?: string
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

export type ScriptureNote = {
  id: string
  user_id: string
  date: string
  scripture: string
  book?: string
  version?: string
  full_text?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export type ConferenceNote = {
  id: string
  user_id: string
  date: string
  speaker: string
  topic?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export type HymnNote = {
  id: string
  user_id: string
  date: string
  hymn: string
  feeling?: string
  created_at?: string
  updated_at?: string
}

export type GratitudeNote = {
  id: string
  user_id: string
  date: string
  content: string
  created_at?: string
  updated_at?: string
}

export type DiscipleshipNote = {
  id: string
  user_id: string
  date: string
  content: string
  created_at?: string
  updated_at?: string
}

export type TaskHistory = {
  id: string
  user_id: string
  task_data: Task[]
  created_at?: string
}

export type CompletedTask = {
  id: string
  user_id: string
  task_id?: string
  title: string
  completed_at?: string
  created_at?: string
  updated_at?: string
}

export type TaskTemplate = {
  id: string
  user_id: string
  name: string
  tasks: any
  created_at?: string
  updated_at?: string
}


export type Ancestor = {
  id: string
  family_id: string
  name: string
  relation?: string
  birth_year?: number
  death_year?: number
  baptized?: boolean
  created_at?: string
  updated_at?: string
}

export type Timer = {
  id: string
  user_id: string
  label: string
  duration: number
  remaining: number
  running: boolean
  created_at?: string
  updated_at?: string
}

export type Person = {
  id: string
  family_id: string
  first_name: string
  last_name?: string
  middle_name?: string
  gender?: string
  birth_date?: string
  death_date?: string
  profile_photo?: string
  created_at?: string
  updated_at?: string
}

export type Relationship = {
  id: string
  family_id: string
  person_id: string
  related_person_id: string
  relationship_type: string
  created_at?: string
  updated_at?: string
}

export type LifeEvent = {
  id: string
  person_id: string
  event_type: string
  event_date?: string
  event_place?: string
  description?: string
  created_at?: string
  updated_at?: string
}

export type Source = {
  id: string
  person_id?: string
  event_id?: string
  title?: string
  description?: string
  url?: string
  created_at?: string
  updated_at?: string
}

export type Media = {
  id: string
  person_id?: string
  event_id?: string
  media_type?: string
  url?: string
  caption?: string
  created_at?: string
  updated_at?: string
}

export type Permission = {
  id: string
  family_id: string
  user_id: string
  role?: string
  created_at?: string
  updated_at?: string
}

// Helper functions
export async function getCurrentUser() {
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('Error getting session:', sessionError)
    return null
  }

  if (!session) {
    return null
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

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