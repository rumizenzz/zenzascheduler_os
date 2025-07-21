import React, { useState } from 'react'
import { X, Calendar, MoveRight } from 'lucide-react'
import dayjs from 'dayjs'

interface MoveScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  fromDate: string
  onMove: (toDate: string) => Promise<void>
}

export function MoveScheduleModal({ isOpen, onClose, fromDate, onMove }: MoveScheduleModalProps) {
  const [toDate, setToDate] = useState(dayjs(fromDate).add(1, 'day').format('YYYY-MM-DD'))
  const [moving, setMoving] = useState(false)

  const handleMove = async () => {
    setMoving(true)
    try {
      await onMove(toDate)
      onClose()
    } finally {
      setMoving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-light text-gray-800 flex items-center gap-2">
              <MoveRight className="w-6 h-6 text-blue-400" />
              Move Schedule
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600/80">Move all tasks from {dayjs(fromDate).format('MMM D, YYYY')} to another day.</p>
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              New Date
            </label>
            <input
              type="date"
              className="input-dreamy w-full"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex justify-between pt-4">
            <button onClick={onClose} className="btn-dreamy">Cancel</button>
            <button onClick={handleMove} disabled={moving} className="btn-dreamy-primary flex items-center gap-2">
              {moving ? (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MoveRight className="w-4 h-4" />
              )}
              Move to {dayjs(toDate).format('MMM D')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
