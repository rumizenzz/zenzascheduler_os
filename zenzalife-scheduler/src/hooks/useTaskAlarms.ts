import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { Task } from '@/lib/supabase'
import { useAudio } from './useAudio'

export function useTaskAlarms(tasks: Task[], defaultSound: string) {
  const { playLoopingAudio, stopAudio } = useAudio()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    tasks.forEach(task => {
      if (task.alarm && task.start_time) {
        const start = dayjs(task.start_time).toDate().getTime()
        const delay = start - Date.now()
        if (delay > 0) {
          const id = setTimeout(() => {
            setActiveTask(task)
            const sound = task.custom_sound_path || defaultSound
            playLoopingAudio(sound, 1)
          }, delay)
          timersRef.current.push(id)
        }
      }
    })

    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [tasks, defaultSound, playLoopingAudio])

  const dismissAlarm = () => {
    stopAudio()
    setActiveTask(null)
  }

  const snoozeAlarm = (minutes: number = 5) => {
    stopAudio()
    if (activeTask && activeTask.start_time) {
      const id = setTimeout(() => {
        setActiveTask(activeTask)
        const sound = activeTask.custom_sound_path || defaultSound
        playLoopingAudio(sound, 1)
      }, minutes * 60 * 1000)
      timersRef.current.push(id)
    }
    setActiveTask(null)
  }

  return { activeTask, dismissAlarm, snoozeAlarm }
}
