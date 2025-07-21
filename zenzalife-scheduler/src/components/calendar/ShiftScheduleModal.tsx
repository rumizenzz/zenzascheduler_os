import React, { useState } from 'react'
import dayjs from 'dayjs'
import { X, Clock } from 'lucide-react'

interface ShiftScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (date: string, time: string) => void
  initialDate: string
  currentStart?: string
}

export function ShiftScheduleModal({ isOpen, onClose, onApply, initialDate, currentStart }: ShiftScheduleModalProps) {
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(currentStart || '06:30')
  const [saving, setSaving] = useState(false)

  const handleApply = async () => {
    setSaving(true)
    try {
      await onApply(date, time)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light text-gray-800 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              Shift Day Schedule
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input-dreamy w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700">New Start Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="input-dreamy w-full"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 gap-3">
            <button onClick={onClose} className="btn-dreamy">Cancel</button>
            <button onClick={handleApply} disabled={saving} className="btn-dreamy-primary">
              {saving ? 'Shifting...' : 'Shift'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

