import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Trash2, Plus, Calendar, MapPin, Clock, Bell, Edit, Trash } from 'lucide-react'
import dayjs from 'dayjs'

interface GarbageSchedule {
  id: string
  user_id: string
  address_id?: string
  waste_type: string
  collection_day: string
  collection_time?: string
  frequency: string
  next_collection: string
  auto_reminder: boolean
  notes?: string
  created_at: string
  updated_at: string
}

const wasteTypes = [
  { value: 'trash', label: 'Regular Trash', color: 'bg-gray-100 text-gray-700', icon: '🗑️' },
  { value: 'recycling', label: 'Recycling', color: 'bg-green-100 text-green-700', icon: '♻️' },
  { value: 'yard_waste', label: 'Yard Waste', color: 'bg-brown-100 text-brown-700', icon: '🍃' },
  { value: 'bulk', label: 'Bulk Items', color: 'bg-blue-100 text-blue-700', icon: '📦' },
  { value: 'hazardous', label: 'Hazardous Waste', color: 'bg-red-100 text-red-700', icon: '⚠️' }
]

const frequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'custom', label: 'Custom' }
]

const daysOfWeek = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

export function GarbageModule() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<GarbageSchedule[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<GarbageSchedule | null>(null)
  const [upcomingCollections, setUpcomingCollections] = useState<GarbageSchedule[]>([])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load garbage schedules
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('garbage_schedule')
        .select('*')
        .eq('user_id', user.id)
        .order('next_collection', { ascending: true })
      
      if (scheduleError) throw scheduleError
      setSchedules(scheduleData || [])
      
      // Get upcoming collections (next 7 days)
      const nextWeek = dayjs().add(7, 'days').format('YYYY-MM-DD')
      const upcoming = (scheduleData || []).filter(
        schedule => schedule.next_collection <= nextWeek
      )
      setUpcomingCollections(upcoming)
      
      // Load addresses
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
      
      if (addressError) throw addressError
      setAddresses(addressData || [])
    } catch (error: any) {
      toast.error('Failed to load garbage schedules: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateNextCollection = (day: string, frequency: string, lastCollection?: string) => {
    const dayIndex = daysOfWeek.findIndex(d => d.value === day.toLowerCase())
    if (dayIndex === -1) return dayjs().format('YYYY-MM-DD')
    
    let nextDate = dayjs()
    
    // Find next occurrence of the day
    while (nextDate.day() !== dayIndex + 1) {
      nextDate = nextDate.add(1, 'day')
    }
    
    // If last collection was recent, move to next cycle
    if (lastCollection) {
      const lastCollectionDate = dayjs(lastCollection)
      const daysSinceLastCollection = nextDate.diff(lastCollectionDate, 'days')
      
      if (daysSinceLastCollection < 7) {
        switch (frequency) {
          case 'weekly':
            nextDate = nextDate.add(1, 'week')
            break
          case 'bi-weekly':
            nextDate = nextDate.add(2, 'weeks')
            break
          case 'monthly':
            nextDate = nextDate.add(1, 'month')
            break
        }
      }
    }
    
    return nextDate.format('YYYY-MM-DD')
  }

  const saveSchedule = async (scheduleData: any) => {
    if (!user) return
    
    try {
      const nextCollection = calculateNextCollection(
        scheduleData.collection_day,
        scheduleData.frequency,
        editingSchedule?.next_collection
      )
      
      const data = {
        ...scheduleData,
        user_id: user.id,
        next_collection: nextCollection,
        updated_at: new Date().toISOString()
      }
      
      if (editingSchedule) {
        // Update existing schedule
        const { error } = await supabase
          .from('garbage_schedule')
          .update(data)
          .eq('id', editingSchedule.id)
        
        if (error) throw error
        toast.success('Schedule updated successfully!')
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('garbage_schedule')
          .insert({ ...data, created_at: new Date().toISOString() })
        
        if (error) throw error
        toast.success('Schedule created successfully!')
      }
      
      await loadData()
      setShowModal(false)
      setEditingSchedule(null)
    } catch (error: any) {
      toast.error('Failed to save schedule: ' + error.message)
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    
    try {
      const { error } = await supabase
        .from('garbage_schedule')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Schedule deleted successfully!')
      await loadData()
    } catch (error: any) {
      toast.error('Failed to delete schedule: ' + error.message)
    }
  }

  const markAsCollected = async (schedule: GarbageSchedule) => {
    try {
      const nextCollection = calculateNextCollection(
        schedule.collection_day,
        schedule.frequency,
        dayjs().format('YYYY-MM-DD')
      )
      
      const { error } = await supabase
        .from('garbage_schedule')
        .update({ 
          next_collection: nextCollection,
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)
      
      if (error) throw error
      
      toast.success('Marked as collected! Next collection updated.')
      await loadData()
    } catch (error: any) {
      toast.error('Failed to update collection: ' + error.message)
    }
  }

  const getWasteTypeInfo = (type: string) => {
    return wasteTypes.find(wt => wt.value === type) || wasteTypes[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <Trash2 className="w-8 h-8 text-gray-400" />
            Garbage & Recycling
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            Never miss a collection day again
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingSchedule(null)
            setShowModal(true)
          }}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Schedule
        </button>
      </div>

      {/* Upcoming Collections */}
      {upcomingCollections.length > 0 && (
        <div className="card-floating p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Upcoming Collections (Next 7 Days)
          </h3>
          
          <div className="grid gap-3">
            {upcomingCollections.map((schedule) => {
              const wasteInfo = getWasteTypeInfo(schedule.waste_type)
              const isToday = dayjs(schedule.next_collection).isSame(dayjs(), 'day')
              const isTomorrow = dayjs(schedule.next_collection).isSame(dayjs().add(1, 'day'), 'day')
              
              return (
                <div key={schedule.id} className={`p-4 rounded-xl border-2 ${
                  isToday 
                    ? 'bg-red-50 border-red-200' 
                    : isTomorrow 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{wasteInfo.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-800">{wasteInfo.label}</h4>
                        <p className="text-sm text-gray-600">
                          {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayjs(schedule.next_collection).format('MMM D')}
                          {schedule.collection_time && ` at ${schedule.collection_time}`}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => markAsCollected(schedule)}
                      className="btn-dreamy text-xs"
                    >
                      Mark Collected
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Schedules */}
      <div className="card-floating p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">All Collection Schedules</h3>
        
        {schedules.length > 0 ? (
          <div className="grid gap-4">
            {schedules.map((schedule) => {
              const wasteInfo = getWasteTypeInfo(schedule.waste_type)
              
              return (
                <div key={schedule.id} className="p-4 bg-gray-50/80 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{wasteInfo.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-800">{wasteInfo.label}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {schedule.collection_day}s
                          </span>
                          <span>{schedule.frequency}</span>
                          {schedule.collection_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {schedule.collection_time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <p className="font-medium text-gray-800">Next Collection</p>
                        <p className="text-gray-600">
                          {dayjs(schedule.next_collection).format('MMM D, YYYY')}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setEditingSchedule(schedule)
                          setShowModal(true)
                        }}
                        className="p-2 text-gray-500 hover:text-blue-500"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteSchedule(schedule.id)}
                        className="p-2 text-gray-500 hover:text-red-500"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {schedule.notes && (
                    <p className="text-sm text-gray-600 bg-white/50 p-2 rounded">
                      {schedule.notes}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No schedules yet</h3>
            <p className="text-gray-600 mb-6">Add your first garbage collection schedule</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-dreamy-primary"
            >
              Add Schedule
            </button>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <ScheduleModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingSchedule(null)
          }}
          onSave={saveSchedule}
          schedule={editingSchedule}
          addresses={addresses}
        />
      )}
    </div>
  )
}

// Schedule Modal Component
interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  schedule?: GarbageSchedule | null
  addresses: any[]
}

function ScheduleModal({ isOpen, onClose, onSave, schedule, addresses }: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    waste_type: schedule?.waste_type || 'trash',
    collection_day: schedule?.collection_day || 'monday',
    collection_time: schedule?.collection_time || '',
    frequency: schedule?.frequency || 'weekly',
    address_id: schedule?.address_id || '',
    auto_reminder: schedule?.auto_reminder ?? true,
    notes: schedule?.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-light text-gray-800 mb-6">
            {schedule ? 'Edit' : 'Add'} Collection Schedule
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Waste Type</label>
                <select
                  value={formData.waste_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, waste_type: e.target.value }))}
                  className="input-dreamy w-full"
                >
                  {wasteTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Collection Day</label>
                <select
                  value={formData.collection_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, collection_day: e.target.value }))}
                  className="input-dreamy w-full"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="input-dreamy w-full"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Collection Time (Optional)</label>
                <input
                  type="time"
                  value={formData.collection_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, collection_time: e.target.value }))}
                  className="input-dreamy w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input-dreamy w-full h-20 resize-none"
                placeholder="Special instructions, bin location, etc."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoReminder"
                checked={formData.auto_reminder}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_reminder: e.target.checked }))}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="autoReminder" className="text-sm text-gray-700">
                Send automatic reminders
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-dreamy">
                Cancel
              </button>
              <button type="submit" className="btn-dreamy-primary">
                {schedule ? 'Update' : 'Create'} Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}