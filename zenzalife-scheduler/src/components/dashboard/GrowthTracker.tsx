import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, GrowthLog } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { TrendingUp, Plus, Calendar, Target, Star, BarChart3 } from 'lucide-react'
import dayjs from 'dayjs'

const identityCategories = [
  'Better Husband',
  'Better Wife', 
  'Better Mom',
  'Better Dad',
  'Better Son',
  'Better Daughter',
  'Better Leader',
  'Better Student',
  'Better Friend',
  'Better Athlete',
  'Better Professional',
  'Better Human'
]

export function GrowthTracker() {
  const { user } = useAuth()
  const [growthLogs, setGrowthLogs] = useState<GrowthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [todayLog, setTodayLog] = useState<GrowthLog | null>(null)
  const [stats, setStats] = useState({
    averageScore: 0,
    totalDays: 0,
    streak: 0,
    completedTasks: 0
  })

  useEffect(() => {
    if (user) {
      loadGrowthLogs()
    }
  }, [user])

  const loadGrowthLogs = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('growth_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)
      
      if (error) throw error
      
      setGrowthLogs(data || [])
      
      // Find today's log
      const today = dayjs().format('YYYY-MM-DD')
      const todaysLog = data?.find(log => log.date === today)
      setTodayLog(todaysLog || null)
      
      // Calculate stats
      calculateStats(data || [])
    } catch (error: any) {
      toast.error('Failed to load growth logs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logs: GrowthLog[]) => {
    if (logs.length === 0) {
      setStats({ averageScore: 0, totalDays: 0, streak: 0, completedTasks: 0 })
      return
    }
    
    const totalScore = logs.reduce((sum, log) => sum + (parseFloat(log.score_1percent?.toString() || '0') || 0), 0)
    const averageScore = totalScore / logs.length
    
    const totalCompleted = logs.reduce((sum, log) => sum + (log.completed_tasks || 0), 0)
    
    // Calculate streak (consecutive days with score >= 0.8)
    let streak = 0
    const sortedLogs = [...logs].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
    
    for (const log of sortedLogs) {
      const score = parseFloat(log.score_1percent?.toString() || '0') || 0
      if (score >= 0.8) {
        streak++
      } else {
        break
      }
    }
    
    setStats({
      averageScore: Math.round(averageScore * 100) / 100,
      totalDays: logs.length,
      streak,
      completedTasks: totalCompleted
    })
  }

  const saveTodayProgress = async (score: number, identityTags: string[], notes: string) => {
    if (!user) return
    
    const today = dayjs().format('YYYY-MM-DD')
    
    try {
      // Get task completion data for today
      const { data: tasks } = await supabase
        .from('tasks')
        .select('completed')
        .eq('user_id', user.id)
        .gte('start_time', today)
        .lt('start_time', dayjs(today).add(1, 'day').format('YYYY-MM-DD'))
      
      const completedTasks = tasks?.filter(t => t.completed).length || 0
      const missedTasks = (tasks?.length || 0) - completedTasks
      
      const logData = {
        user_id: user.id,
        date: today,
        score_1percent: score,
        identity_tags: identityTags,
        completed_tasks: completedTasks,
        missed_tasks: missedTasks,
        notes: notes || null,
        updated_at: new Date().toISOString()
      }
      
      if (todayLog) {
        // Update existing log
        const { error } = await supabase
          .from('growth_logs')
          .update(logData)
          .eq('id', todayLog.id)
        
        if (error) throw error
        toast.success('Progress updated successfully!')
      } else {
        // Create new log
        const { error } = await supabase
          .from('growth_logs')
          .insert({ ...logData, created_at: new Date().toISOString() })
        
        if (error) throw error
        toast.success('Progress logged successfully!')
      }
      
      await loadGrowthLogs()
      setShowAddModal(false)
    } catch (error: any) {
      toast.error('Failed to save progress: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            1% Better Tracker
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            Track your daily progress towards becoming the best version of yourself
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Today's Progress
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-green-500 mb-2">
            {stats.averageScore}
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
        
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-blue-500 mb-2">
            {stats.totalDays}
          </div>
          <div className="text-sm text-gray-600">Days Tracked</div>
        </div>
        
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-orange-500 mb-2">
            {stats.streak}
          </div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-purple-500 mb-2">
            {stats.completedTasks}
          </div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
        </div>
      </div>

      {/* Today's Progress */}
      {todayLog ? (
        <div className="card-floating p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Today's Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-light text-green-500 mb-1">
                {todayLog.score_1percent}
              </div>
              <div className="text-sm text-gray-600">1% Better Score</div>
            </div>
            <div>
              <div className="text-xl font-light text-blue-500 mb-1">
                {todayLog.completed_tasks}/{(todayLog.completed_tasks || 0) + (todayLog.missed_tasks || 0)}
              </div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div>
              <div className="text-sm text-gray-700 mb-1">Identity Focus:</div>
              <div className="flex flex-wrap gap-1">
                {(todayLog.identity_tags as string[] || []).map((tag, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {todayLog.notes && (
            <div className="mt-4 p-3 bg-gray-50/80 rounded-lg">
              <p className="text-sm text-gray-700">{todayLog.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card-floating p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No progress logged today</h3>
          <p className="text-gray-600 mb-4">Start tracking your 1% better journey for today</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-dreamy-primary"
          >
            Log Today's Progress
          </button>
        </div>
      )}

      {/* Recent Progress */}
      <div className="card-floating p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Recent Progress
        </h3>
        
        {growthLogs.length > 0 ? (
          <div className="space-y-3">
            {growthLogs.slice(0, 7).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-600">
                    {dayjs(log.date).format('MMM D')}
                  </div>
                  <div className={`text-lg font-medium ${
                    (parseFloat(log.score_1percent?.toString() || '0') || 0) >= 1 
                      ? 'text-green-500' 
                      : (parseFloat(log.score_1percent?.toString() || '0') || 0) >= 0.5
                      ? 'text-yellow-500'
                      : 'text-red-500'
                  }`}>
                    {log.score_1percent}
                  </div>
                  <div className="text-sm text-gray-600">
                    {log.completed_tasks}/{(log.completed_tasks || 0) + (log.missed_tasks || 0)} tasks
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {((log.identity_tags as string[]) || []).slice(0, 3).map((tag, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No progress logs yet. Start your 1% better journey today!</p>
        )}
      </div>

      {/* Progress Modal */}
      {showAddModal && (
        <ProgressModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={saveTodayProgress}
          existingLog={todayLog}
        />
      )}
    </div>
  )
}

// Progress Modal Component
interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (score: number, identityTags: string[], notes: string) => void
  existingLog?: GrowthLog | null
}

function ProgressModal({ isOpen, onClose, onSave, existingLog }: ProgressModalProps) {
  const [score, setScore] = useState(existingLog?.score_1percent?.toString() || '1')
  const [selectedIdentities, setSelectedIdentities] = useState<string[]>(
    (existingLog?.identity_tags as string[]) || []
  )
  const [notes, setNotes] = useState(existingLog?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const scoreNum = parseFloat(score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 2) {
      toast.error('Please enter a valid score between 0 and 2')
      return
    }
    
    onSave(scoreNum, selectedIdentities, notes)
  }

  const toggleIdentity = (identity: string) => {
    setSelectedIdentities(prev => 
      prev.includes(identity)
        ? prev.filter(i => i !== identity)
        : [...prev, identity]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-gray-800">
              {existingLog ? 'Update' : 'Log'} Today's Progress
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Score */}
            <div className="space-y-2">
              <label htmlFor="growthScore" className="text-sm font-medium text-gray-700">1% Better Score (0-2)</label>
              <input
                id="growthScore"
                name="growthScore"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="input-dreamy w-full"
                placeholder="1.0"
              />
              <p className="text-xs text-gray-500">
                0 = Worse than yesterday, 1 = Same as yesterday, 2 = Much better than yesterday
              </p>
            </div>

            {/* Identity Categories */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Identity Focus (Select all that apply)</p>
              <div className="grid grid-cols-2 gap-2">
                {identityCategories.map((identity) => (
                  <button
                    key={identity}
                    type="button"
                    onClick={() => toggleIdentity(identity)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      selectedIdentities.includes(identity)
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {identity}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="growthNotes" className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea
                id="growthNotes"
                name="growthNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-dreamy w-full h-24 resize-none"
                placeholder="What made today special? What did you learn?"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-dreamy">
                Cancel
              </button>
              <button type="submit" className="btn-dreamy-primary">
                {existingLog ? 'Update' : 'Log'} Progress
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}