import React, { useState } from 'react'
import { X, Clock, Calendar, CheckCircle } from 'lucide-react'
import dayjs from 'dayjs'
import { defaultScheduleTemplate, DefaultScheduleItem } from '@/data/defaultSchedule'

interface DefaultScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (date: string, items: DefaultScheduleItem[]) => void
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    exercise: '#f59e0b',
    study: '#3b82f6',
    spiritual: '#ec4899',
    work: '#10b981',
    personal: '#6366f1',
    hygiene: '#0ea5e9',
    meal: '#65a30d',
    doordash: '#ee2723',
    ubereats: '#06c167',
    olivegarden: '#6c9321',
    other: '#6b7280',
  }
  return colors[category] || '#6b7280'
}

export function DefaultScheduleModal({ isOpen, onClose, onApply }: DefaultScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [applying, setApplying] = useState(false)
  const [items, setItems] = useState<DefaultScheduleItem[]>(defaultScheduleTemplate)

  const updateItem = (index: number, changes: Partial<DefaultScheduleItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...changes } : it)))
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      await onApply(selectedDate, items)
      onClose()
    } catch (error) {
      console.error('Failed to apply default schedule:', error)
    } finally {
      setApplying(false)
    }
  }

  if (!isOpen) return null

  const formatTime = (t: string) => dayjs(`1970-01-01T${t}`).format('h:mm A')

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-light text-gray-800 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-400" />
                Default Schedule Template
              </h2>
              <p className="text-sm text-gray-600/80 font-light mt-1">
                Apply the complete daily routine designed for 1% better living
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Select Date to Apply Schedule
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-dreamy w-full max-w-xs"
              min={dayjs().format('YYYY-MM-DD')}
            />
          </div>

          {/* Schedule Preview */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Schedule Overview
            </h3>

            <div className="grid gap-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-white/50 rounded-xl border border-white/50"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  ></div>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-600 min-w-[150px]">
                    <input
                      type="time"
                      value={item.start}
                      onChange={(e) => updateItem(index, { start: e.target.value })}
                      className="input-dreamy w-24"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={item.end}
                      onChange={(e) => updateItem(index, { end: e.target.value })}
                      className="input-dreamy w-24"
                    />
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                    className="input-dreamy flex-1 text-sm"
                  />
                  <div
                    className="text-xs px-2 py-1 rounded-full text-white font-medium capitalize"
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  >
                    {item.category}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button onClick={onClose} className="btn-dreamy">
              Cancel
            </button>

            <button onClick={handleApply} disabled={applying} className="btn-dreamy-primary flex items-center gap-2">
              {applying ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Apply Schedule to {dayjs(selectedDate).format('MMM D, YYYY')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
