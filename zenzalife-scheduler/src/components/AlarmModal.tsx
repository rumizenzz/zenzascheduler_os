import React, { useEffect } from 'react'
import dayjs from 'dayjs'
import { Task } from '@/lib/supabase'
import { useAudio } from '@/hooks/useAudio'

interface AlarmModalProps {
  task: Task
  soundUrl: string
  onDismiss: () => void
  onSnooze: () => void
}

export function AlarmModal({ task, soundUrl, onDismiss, onSnooze }: AlarmModalProps) {
  const { playLoopingAudio, stopAudio } = useAudio()

  useEffect(() => {
    playLoopingAudio(soundUrl, 1)
    return () => {
      stopAudio()
    }
  }, [soundUrl, playLoopingAudio, stopAudio])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600/90 animate-pulse">
      <div className="bg-white p-8 rounded-xl space-y-4 max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-900">{task.title}</h2>
        {task.start_time && (
          <p className="text-gray-700">
            {dayjs(task.start_time).format('MMM D, h:mm A')}
          </p>
        )}
        <div className="flex justify-center gap-4">
          <button onClick={onDismiss} className="btn-dreamy-primary px-4 py-2">
            Dismiss
          </button>
          <button onClick={onSnooze} className="btn-dreamy px-4 py-2">
            Snooze 5m
          </button>
        </div>
      </div>
    </div>
  )
}
