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
  entrance_sound_enabled?: boolean
  entrance_animation_enabled?: boolean
  entrance_duration_seconds?: number
  last_dashboard_tab?: string
  last_login?: string
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
  all_day?: boolean
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

export type Reminder = {
  id: string
  user_id: string
  title: string
  category?: string
  remind_at: string
  completed?: boolean
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
  is_favorite?: boolean
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

export type Idea = {
  id: string
  user_id: string
  content: string
  completed?: boolean
  created_at?: string
  updated_at?: string
}

export type TodoItem = {
  id: string
  user_id: string
  content: string
  category: string
  list_id?: string
  completed?: boolean
  missing?: boolean
  status?: string
  created_at?: string
  updated_at?: string
}

export type GroceryList = {
  id: string
  user_id: string
  title: string
  list_date?: string
  created_at?: string
  updated_at?: string
}

export type PasswordEntry = {
  id: string
  user_id: string
  title: string
  username?: string | null
  url?: string | null
  password: string
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export type JournalEntry = {
  id: string
  user_id: string
  created_at: string
  content: string
  updated_at?: string
}

export type DreamJournalEntry = {
  id: string
  user_id: string
  created_at: string
  title: string
  description: string
  achieved_lucidity: boolean
  lucidity_level?: number
  updated_at?: string
}

export type JournalEntryHistory = {
  id: string
  entry_id: string
  user_id: string
  content: string
  edited_at: string
}

export type DreamJournalEntryHistory = {
  id: string
  entry_id: string
  user_id: string
  title: string
  description: string
  edited_at: string
}

export type GracePrayer = {
  id: string
  user_id: string
  meal_time: string
  audio_url: string
  photo_url?: string
  started_at: string
  duration_seconds: number
  created_at?: string
  updated_at?: string
}

export type DailyPrayer = {
  id: string
  user_id: string
  prayer_type: string
  audio_url: string
  started_at: string
  duration_seconds: number
  created_at?: string
  updated_at?: string
}

export type Fast = {
  id: string
  user_id: string
  start_time: string
  duration_hours: number
  allow_water?: boolean
  created_at?: string
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

export type TaskComment = {
  id: string
  task_id: string
  author_id: string
  content: string
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

export type MathProblem = {
  id: string
  user_id: string
  name: string
  data: any
  created_at?: string
  updated_at?: string
}

export type MathProblemVersion = {
  id: string
  problem_id: string
  data: any
  created_at?: string
}

export type MathSolverHistory = {
  id: string
  user_id: string
  expression: string
  result: string
  created_at?: string
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

export type TimerPreset = {
  id: string
  user_id: string
  label: string
  duration: number
  created_at?: string
  updated_at?: string
}

export type Stopwatch = {
  id: string
  user_id: string
  label: string
  elapsed: number
  created_at?: string
  updated_at?: string
}

export type OSWindow = {
  id: string
  user_id: string
  title: string
  content?: string
  x: number
  y: number
  width: number
  height: number
  z_index: number
  created_at?: string
  updated_at?: string
}

export type WorldClockZone = {
  id: string
  user_id: string
  zone: string
  show_widget?: boolean
  pos_x?: number
  pos_y?: number
  created_at?: string
  updated_at?: string
}

export type CalendarPreference = {
  user_id: string
  selected_year: number
  created_at?: string
  updated_at?: string
}

export type ChangeLogEntry = {
  id: string
  version: string
  title: string
  message?: string
  tags?: string[]
  author?: string
  icon_url?: string
  media_url?: string
  created_at?: string
}

export type ChangeLogView = {
  user_id: string
  last_seen: string
  created_at?: string
  updated_at?: string
}

export type GEDMathStudySession = {
  id: string
  user_id: string
  mode: string
  stage?: string
  created_at?: string
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

export async function getLastSeenChangelog(userId: string) {
  const { data, error } = await supabase
    .from('changelog_views')
    .select('last_seen')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching changelog view:', error)
    return null
  }

  return data?.last_seen || null
}

export async function updateLastSeenChangelog(userId: string, timestamp: string) {
  const { error } = await supabase
    .from('changelog_views')
    .upsert({ user_id: userId, last_seen: timestamp }, { onConflict: 'user_id' })

  if (error) {
    console.error('Error updating changelog view:', error)
  }
}
