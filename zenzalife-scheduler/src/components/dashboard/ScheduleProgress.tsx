import React, { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Task } from '@/lib/supabase'

export function ScheduleProgress() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [nextTask, setNextTask] = useState<Task | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [focusMode, setFocusMode] = useState(false)
  const [now, setNow] = useState(new Date())
  const prevTaskRef = useRef<string | null>(null)
  const startAudio = useRef<HTMLAudioElement | null>(null)
  const endAudio = useRef<HTMLAudioElement | null>(null)
  const lastAudio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    startAudio.current = new Audio('/audio/entrance-chime.mp3')
    endAudio.current = new Audio('/audio/entrance-chime.mp3')
    lastAudio.current = new Audio('/audio/entrance-chime.mp3')
  }, [])

  useEffect(() => {
    if (!user) return
    const today = dayjs().format('YYYY-MM-DD')
    const load = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', today)
        .lt('start_time', dayjs(today).add(1, 'day').format('YYYY-MM-DD'))
        .order('start_time')
      if (!error) {
        setTasks(data || [])
      }
    }
    void load()
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
      const nowTime = dayjs()
      const current = tasks.find(
        t => t.start_time && t.end_time && nowTime.isAfter(t.start_time) && nowTime.isBefore(t.end_time)
      )
      const upcoming = tasks.find(t => t.start_time && nowTime.isBefore(t.start_time))
      setCurrentTask(current || null)
      setNextTask(upcoming || null)
      let target = null
      if (current) {
        target = dayjs(current.end_time)
      } else if (upcoming) {
        target = dayjs(upcoming.start_time)
      }
      if (target) {
        setTimeRemaining(target.diff(nowTime, 'second'))
      } else {
        setTimeRemaining(0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [tasks])

  useEffect(() => {
    const prev = prevTaskRef.current
    const curr = currentTask ? currentTask.id : null
    if (prev && prev !== curr) {
      endAudio.current?.play().catch(() => {})
      if (!curr && tasks.length > 0 && prev === tasks[tasks.length - 1].id) {
        lastAudio.current?.play().catch(() => {})
      }
    }
    if (curr && prev !== curr) {
      startAudio.current?.play().catch(() => {})
    }
    prevTaskRef.current = curr
  }, [currentTask, tasks])

  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const hourDeg = (hours % 12) * 30 + minutes * 0.5
  const minuteDeg = minutes * 6 + seconds * 0.1
  const secondDeg = seconds * 6

  const hoursLeft = Math.floor(timeRemaining / 3600)
  const minutesLeft = Math.floor((timeRemaining % 3600) / 60)
  const secondsLeft = Math.max(timeRemaining % 60, 0)
  const countdown = `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft
    .toString()
    .padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`

  if (tasks.length === 0) return null

  return (
    <>
      <div
        className="fixed top-4 right-4 bg-white/70 backdrop-blur-lg p-4 rounded-lg shadow cursor-pointer"
        onClick={() => setFocusMode(true)}
      >
        <div className="text-sm text-gray-600 mb-2">
          Schedule In Progress for {currentTask ? currentTask.title : nextTask ? nextTask.title : 'No Tasks'}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 border-4 border-blue-200 rounded-full flex items-center justify-center">
            <div
              className="absolute w-1 h-6 bg-gray-700 origin-bottom"
              style={{ transform: `rotate(${hourDeg}deg)` }}
            />
            <div
              className="absolute w-1 h-8 bg-gray-500 origin-bottom"
              style={{ transform: `rotate(${minuteDeg}deg)` }}
            />
            <div
              className="absolute w-0.5 h-9 bg-red-500 origin-bottom"
              style={{ transform: `rotate(${secondDeg}deg)` }}
            />
          </div>
          <div className="text-lg font-mono text-gray-800">{countdown}</div>
        </div>
      </div>
      {focusMode && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex flex-col items-center justify-center z-50"
          onClick={() => setFocusMode(false)}
        >
          <div className="text-2xl mb-4 text-gray-700">{currentTask ? currentTask.title : 'Up Next'}</div>
          <div className="text-6xl font-mono text-gray-800">{countdown}</div>
          <p className="mt-6 text-sm text-gray-500">Tap anywhere to exit focus mode</p>
        </div>
      )}
    </>
  )
}
