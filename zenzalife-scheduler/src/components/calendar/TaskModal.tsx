import React, { useState, useEffect } from 'react'
import { Task } from '@/lib/supabase'
import { X, Clock, Tag, Bell, Users, Target, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: any) => void
  onDelete?: () => void
  task?: Task | null
  initialDate?: string | null
}

const categories = [
  { value: 'exercise', label: 'Exercise', color: '#f59e0b' },
  { value: 'study', label: 'Study', color: '#3b82f6' },
  { value: 'spiritual', label: 'Spiritual', color: '#ec4899' },
  { value: 'work', label: 'Work', color: '#10b981' },
  { value: 'personal', label: 'Personal', color: '#6366f1' },
  { value: 'family', label: 'Family', color: '#ef4444' },
  { value: 'hygiene', label: 'Hygiene', color: '#0ea5e9' },
  { value: 'meal', label: 'Meal', color: '#65a30d' },
  { value: 'other', label: 'Other', color: '#6b7280' }
]

const repeatPatterns = [
  { value: 'none', label: 'No Repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekdays', label: 'Weekdays Only' },
  { value: 'weekends', label: 'Weekends Only' }
]

const visibilityOptions = [
  { value: 'private', label: 'Private' },
  { value: 'family', label: 'Family' },
  { value: 'public', label: 'Public' }
]

export function TaskModal({ isOpen, onClose, onSave, onDelete, task, initialDate }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    start_time: '',
    end_time: '',
    repeat_pattern: 'none',
    alarm: false,
    visibility: 'private',
    completed: false
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        category: task.category || 'other',
        start_time: task.start_time ? dayjs(task.start_time).format('YYYY-MM-DDTHH:mm') : '',
        end_time: task.end_time ? dayjs(task.end_time).format('YYYY-MM-DDTHH:mm') : '',
        repeat_pattern: task.repeat_pattern || 'none',
        alarm: task.alarm || false,
        visibility: task.visibility || 'private',
        completed: task.completed || false
      })
    } else if (initialDate) {
      const startTime = dayjs(initialDate).hour(9).minute(0).format('YYYY-MM-DDTHH:mm')
      const endTime = dayjs(initialDate).hour(10).minute(0).format('YYYY-MM-DDTHH:mm')
      
      setFormData({
        title: '',
        category: 'other',
        start_time: startTime,
        end_time: endTime,
        repeat_pattern: 'none',
        alarm: false,
        visibility: 'private',
        completed: false
      })
    }
  }, [task, initialDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a task title')
      return
    }
    
    if (!formData.start_time) {
      alert('Please select a start time')
      return
    }
    
    onSave({
      title: formData.title.trim(),
      category: formData.category,
      start_time: formData.start_time,
      end_time: formData.end_time || null,
      repeat_pattern: formData.repeat_pattern,
      alarm: formData.alarm,
      visibility: formData.visibility,
      completed: formData.completed
    })
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const autoSetEndTime = () => {
    if (formData.start_time) {
      const endTime = dayjs(formData.start_time).add(1, 'hour').format('YYYY-MM-DDTHH:mm')
      handleChange('end_time', endTime)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-gray-800">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input-dreamy w-full"
                placeholder="What needs to be done?"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="input-dreamy w-full"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Visibility
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleChange('visibility', e.target.value)}
                  className="input-dreamy w-full"
                >
                  {visibilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                  className="input-dreamy w-full"
                  required
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  End Time
                  <button
                    type="button"
                    onClick={autoSetEndTime}
                    className="text-xs text-blue-500 hover:text-blue-700 ml-2"
                  >
                    +1 hour
                  </button>
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                  className="input-dreamy w-full"
                />
              </div>
            </div>

            {/* Repeat Pattern */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Repeat Pattern
              </label>
              <select
                value={formData.repeat_pattern}
                onChange={(e) => handleChange('repeat_pattern', e.target.value)}
                className="input-dreamy w-full"
              >
                {repeatPatterns.map(pattern => (
                  <option key={pattern.value} value={pattern.value}>
                    {pattern.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.alarm}
                  onChange={(e) => handleChange('alarm', e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Set Alarm
                </span>
              </label>

              {task && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.completed}
                    onChange={(e) => handleChange('completed', e.target.checked)}
                    className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Mark as Completed
                  </span>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <div>
                {task && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="btn-dreamy text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-dreamy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-dreamy-primary"
                >
                  {task ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}