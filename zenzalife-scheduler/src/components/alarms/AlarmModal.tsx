import React from 'react'
import { useAlarm } from '@/hooks/useAlarm'

interface AlarmModalProps {
  isOpen: boolean
  onDismiss: () => void
  soundSrc: string
  message: string
}

export function AlarmModal({ isOpen, onDismiss, soundSrc, message }: AlarmModalProps) {
  const { playAlarm, stopAlarm } = useAlarm()

  React.useEffect(() => {
    if (isOpen) {
      playAlarm(soundSrc)
    } else {
      stopAlarm()
    }
    return stopAlarm
  }, [isOpen, soundSrc, playAlarm, stopAlarm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white p-6 rounded-xl shadow-xl space-y-4 w-80 text-center animate-pulse">
        <p className="text-lg font-semibold">{message}</p>
        <button onClick={onDismiss} className="btn-dreamy-primary w-full">Dismiss</button>
      </div>
    </div>
  )
}
