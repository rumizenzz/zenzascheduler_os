import { useRef, useCallback } from 'react'

export function useAlarm() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playAlarm = useCallback((src: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      const alarm = new Audio(src)
      alarm.loop = true
      alarm.volume = 1
      audioRef.current = alarm
      alarm.play().catch(() => {
        console.warn('Alarm could not play, maybe due to user interaction.')
      })
    } catch (err) {
      console.error('Error playing alarm', err)
    }
  }, [])

  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  return {
    playAlarm,
    stopAlarm
  }
}
