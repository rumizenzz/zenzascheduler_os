import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Affirmation } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Heart, Plus, Star, Share2, Calendar, Filter } from 'lucide-react'
import dayjs from 'dayjs'

type AffirmationType = 'personal' | 'family' | 'spiritual' | 'goals' | 'gratitude'

const affirmationTypes = [
  { value: 'personal', label: 'Personal Growth', color: 'bg-blue-100 text-blue-700' },
  { value: 'family', label: 'Family Love', color: 'bg-pink-100 text-pink-700' },
  { value: 'spiritual', label: 'Spiritual', color: 'bg-purple-100 text-purple-700' },
  { value: 'goals', label: 'Goals & Dreams', color: 'bg-green-100 text-green-700' },
  { value: 'gratitude', label: 'Gratitude', color: 'bg-yellow-100 text-yellow-700' }
]

export function AffirmationsModule() {
  const { user, profile } = useAuth()
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [todayAffirmation, setTodayAffirmation] = useState<Affirmation | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (user) {
      loadAffirmations()
    }
  }, [user, filterType])

  const loadAffirmations = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      let query = supabase
        .from('affirmations')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      if (filterType !== 'all') {
        query = query.eq('type', filterType)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setAffirmations(data || [])
      
      // Find today's affirmation
      const today = dayjs().format('YYYY-MM-DD')
      const todaysAffirmation = data?.find(aff => aff.date === today)
      setTodayAffirmation(todaysAffirmation || null)
      
      // Calculate streak
      calculateStreak(data || [])
    } catch (error: any) {
      toast.error('Failed to load affirmations: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateStreak = (affirmations: Affirmation[]) => {
    let streakCount = 0
    const today = dayjs()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = today.subtract(i, 'day').format('YYYY-MM-DD')
      const hasAffirmation = affirmations.some(aff => aff.date === checkDate && aff.completed)
      
      if (hasAffirmation) {
        streakCount++
      } else if (i > 0) {
        break // Only break if it's not today (user might not have done today's yet)
      }
    }
    
    setStreak(streakCount)
  }

  const saveAffirmation = async (content: string, type: AffirmationType, isShared: boolean) => {
    if (!user) return
    
    const today = dayjs().format('YYYY-MM-DD')
    
    try {
      const affirmationData = {
        user_id: user.id,
        date: today,
        content: content.trim(),
        type,
        shared_with: isShared ? [profile?.family_id] : null,
        completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      if (todayAffirmation) {
        // Update existing affirmation
        const { error } = await supabase
          .from('affirmations')
          .update(affirmationData)
          .eq('id', todayAffirmation.id)
        
        if (error) throw error
        toast.success('Affirmation updated successfully!')
      } else {
        // Create new affirmation
        const { error } = await supabase
          .from('affirmations')
          .insert(affirmationData)
        
        if (error) throw error
        toast.success('Affirmation saved successfully!')
      }
      
      await loadAffirmations()
      setShowAddModal(false)
    } catch (error: any) {
      toast.error('Failed to save affirmation: ' + error.message)
    }
  }

  const toggleFavorite = async (affirmationId: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('affirmations')
        .update({ is_favorite: !isFavorite, updated_at: new Date().toISOString() })
        .eq('id', affirmationId)
      
      if (error) throw error
      
      await loadAffirmations()
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
    } catch (error: any) {
      toast.error('Failed to update favorite: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-400" />
            Daily Affirmations
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            Speak life into your dreams and identity
          </p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-dreamy"
          >
            <option value="all">All Types</option>
            {affirmationTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {todayAffirmation ? 'Update Today' : 'Add Today'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-pink-500 mb-2">
            {streak}
          </div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-purple-500 mb-2">
            {affirmations.filter(a => a.is_favorite).length}
          </div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>
        
        <div className="card-floating p-6 text-center">
          <div className="text-3xl font-light text-blue-500 mb-2">
            {affirmations.length}
          </div>
          <div className="text-sm text-gray-600">Total Affirmations</div>
        </div>
      </div>

      {/* Today's Affirmation */}
      {todayAffirmation ? (
        <div className="card-floating p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Today's Affirmation
          </h3>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
            <p className="text-lg text-gray-800 leading-relaxed mb-4">
              "{todayAffirmation.content}"
            </p>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm ${
                affirmationTypes.find(t => t.value === todayAffirmation.type)?.color || 'bg-gray-100 text-gray-700'
              }`}>
                {affirmationTypes.find(t => t.value === todayAffirmation.type)?.label || 'Other'}
              </span>
              <button
                onClick={() => toggleFavorite(todayAffirmation.id, todayAffirmation.is_favorite || false)}
                className={`p-2 rounded-full transition-colors ${
                  todayAffirmation.is_favorite 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <Star className={`w-5 h-5 ${todayAffirmation.is_favorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-floating p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No affirmation for today</h3>
          <p className="text-gray-600 mb-4">Start your day with a powerful affirmation</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-dreamy-primary"
          >
            Create Today's Affirmation
          </button>
        </div>
      )}

      {/* Affirmations History */}
      <div className="card-floating p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Your Affirmation Journey</h3>
        
        {affirmations.length > 0 ? (
          <div className="space-y-4">
            {affirmations.map((affirmation) => (
              <div key={affirmation.id} className="p-4 bg-gray-50/80 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      {dayjs(affirmation.date).format('MMM D, YYYY')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      affirmationTypes.find(t => t.value === affirmation.type)?.color || 'bg-gray-100 text-gray-700'
                    }`}>
                      {affirmationTypes.find(t => t.value === affirmation.type)?.label || 'Other'}
                    </span>
                    {affirmation.shared_with && (
                      <Share2 className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <button
                    onClick={() => toggleFavorite(affirmation.id, affirmation.is_favorite || false)}
                    className={`p-1 rounded-full transition-colors ${
                      affirmation.is_favorite 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${affirmation.is_favorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  "{affirmation.content}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No affirmations yet. Start your daily affirmation practice!</p>
        )}
      </div>

      {/* Add Affirmation Modal */}
      {showAddModal && (
        <AffirmationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={saveAffirmation}
          existingAffirmation={todayAffirmation}
        />
      )}
    </div>
  )
}

// Affirmation Modal Component
interface AffirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string, type: AffirmationType, isShared: boolean) => void
  existingAffirmation?: Affirmation | null
}

function AffirmationModal({ isOpen, onClose, onSave, existingAffirmation }: AffirmationModalProps) {
  const [content, setContent] = useState(existingAffirmation?.content || '')
  const [type, setType] = useState<AffirmationType>((existingAffirmation?.type as AffirmationType) || 'personal')
  const [isShared, setIsShared] = useState(!!existingAffirmation?.shared_with)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error('Please enter an affirmation')
      return
    }
    
    onSave(content, type, isShared)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-gray-800">
              {existingAffirmation ? 'Update' : 'Create'} Today's Affirmation
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Affirmation</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-dreamy w-full h-32 resize-none"
                placeholder="I am becoming the best version of myself every day..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AffirmationType)}
                className="input-dreamy w-full"
              >
                {affirmationTypes.map(affType => (
                  <option key={affType.value} value={affType.value}>
                    {affType.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="shareWithFamily"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <label htmlFor="shareWithFamily" className="text-sm text-gray-700">
                Share with family
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-dreamy">
                Cancel
              </button>
              <button type="submit" className="btn-dreamy-primary">
                {existingAffirmation ? 'Update' : 'Save'} Affirmation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}