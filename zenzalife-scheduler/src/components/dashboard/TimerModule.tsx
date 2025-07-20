import React, { useState, useEffect } from 'react'
import { Timer as TimerIcon, Plus, Pause, Play, RotateCcw } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'
import { supabase, Timer as TimerType } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'


export function TimerModule() {
  const { user } = useAuth()
  const [timers, setTimers] = useState<TimerType[]>([])
  const [label, setLabel] = useState('')
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const { playAudio } = useAudio()

  useEffect(() => {
    if (user) {
      loadTimers()
    }
  }, [user])

  const loadTimers = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at')

      if (error) throw error
      setTimers(data || [])
    } catch (error: any) {
      toast.error('Failed to load timers: ' + error.message)
    }
  }

  // Tick running timers every second
  const updateTimerDb = async (id: string, updates: Partial<TimerType>) => {
    await supabase
      .from('timers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!user) return
      setTimers(current => {
        const updated = current.map(t => {
          if (!t.running) return t
          if (t.remaining <= 1) {
            playAudio('/alarms/lucid-skybell.mp3')
            void updateTimerDb(t.id, { running: false, remaining: 0 })
            return { ...t, running: false, remaining: 0 }
          }
          const newRemaining = t.remaining - 1
          void updateTimerDb(t.id, { remaining: newRemaining })
          return { ...t, remaining: newRemaining }
        })
        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [playAudio, user])

  const addTimer = async () => {
    if (!user) return
    const totalSeconds = minutes * 60 + seconds
    if (totalSeconds <= 0) return
    try {
      const { data, error } = await supabase
        .from('timers')
        .insert({
          user_id: user.id,
          label: label || 'Timer',
          duration: totalSeconds,
          remaining: totalSeconds,
          running: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        setTimers([...timers, data])
        setLabel('')
        setMinutes(0)
        setSeconds(0)
      }
    } catch (error: any) {
      toast.error('Failed to add timer: ' + error.message)
    }
  }

  const toggleTimer = async (id: string) => {
    let newState = false
    setTimers(prev =>
      prev.map(t => {
        if (t.id === id) {
          newState = !t.running
          return { ...t, running: newState }
        }
        return t
      })
    )
    void updateTimerDb(id, { running: newState })
  }

  const resetTimer = async (id: string) => {
    let duration = 0
    setTimers(prev =>
      prev.map(t => {
        if (t.id === id) {
          duration = t.duration
          return { ...t, remaining: t.duration, running: false }
        }
        return t
      })
    )
    void updateTimerDb(id, { remaining: duration, running: false })
  }

  const format = (total: number) => {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light flex items-center gap-2">
            <TimerIcon className="w-6 h-6 text-blue-500" /> Timers
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            Manage multiple countdowns for any activity
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="input-dreamy w-32"
          />
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minutes}
            onChange={e => setMinutes(parseInt(e.target.value) || 0)}
            className="input-dreamy w-20"
          />
          <input
            type="number"
            min="0"
            placeholder="Sec"
            value={seconds}
            onChange={e => setSeconds(parseInt(e.target.value) || 0)}
            className="input-dreamy w-20"
          />
          <button onClick={addTimer} className="btn-dreamy-primary flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {timers.length === 0 ? (
        <div className="card-floating p-6 text-center">No timers yet</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {timers.map(timer => (
            <div key={timer.id} className="card-floating p-4 space-y-2 text-center">
              <div className="text-lg font-medium text-gray-800">{timer.label}</div>
              <div className="text-3xl font-light text-blue-600">{format(timer.remaining)}</div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => toggleTimer(timer.id)}
                  className="btn-dreamy-primary px-3 py-1"
                >
                  {timer.running ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => resetTimer(timer.id)}
                  className="btn-dreamy-secondary px-3 py-1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

