import React, { useState, useEffect, useRef } from 'react'
import dayjs from 'dayjs'
import { Calendar as CalendarIcon, Mic, StopCircle, Play } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase, PrayerAudio } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useAudio } from '@/hooks/useAudio'

export function PrayerScheduler() {
  const { user } = useAuth()
  const { playAudio, stopAudio } = useAudio()
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [audios, setAudios] = useState<PrayerAudio[]>([])
  const [category, setCategory] = useState<'wake_up' | 'sleep'>('wake_up')
  const [recording, setRecording] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<Date | null>(null)

  useEffect(() => {
    if (user) loadAudios()
  }, [user, selectedDate])

  const loadAudios = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('prayer_audios')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', selectedDate)
      .order('category')
    if (error) {
      toast.error('Failed to load audios')
      return
    }
    setAudios(data || [])
  }

  const startRecording = async () => {
    if (!user) return toast.error('Sign in required')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = handleStop
      recorder.start()
      startTimeRef.current = new Date()
      setRecording(true)
    } catch (err) {
      toast.error('Failed to start recording')
    }
  }

  const handleStop = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const duration = Math.round(blob.size / 1000)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string
        const fileName = `prayer-${category}-${Date.now()}.webm`
        const { data, error } = await supabase.functions.invoke('audio-upload', {
          body: { audioData: base64Data, fileName, userId: user!.id }
        })
        if (error || !data?.publicUrl) throw error
        await supabase.from('prayer_audios').insert({
          user_id: user!.id,
          date: selectedDate,
          category,
          audio_url: data.publicUrl,
          duration
        })
        toast.success('Prayer saved')
        loadAudios()
      } catch (err: any) {
        toast.error('Upload failed: ' + err.message)
      } finally {
        setRecording(false)
      }
    }
    reader.readAsDataURL(blob)
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
  }

  const play = (url: string) => {
    playAudio(url, 1, false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-purple-500" /> Grace Prayer Scheduler
          </h1>
          <p className="text-gray-600/80 font-light mt-1">
            Listen or record prayers for any day
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input-dreamy"
        />
      </div>
      <div className="card-floating p-6 space-y-4">
        <div className="flex gap-3">
          <select
            value={category}
            onChange={e => setCategory(e.target.value as 'wake_up' | 'sleep')}
            className="input-dreamy"
          >
            <option value="wake_up">Wake Up</option>
            <option value="sleep">Sleep</option>
          </select>
          {!recording ? (
            <button onClick={startRecording} className="btn-dreamy-primary flex items-center gap-2">
              <Mic className="w-4 h-4" /> Record
            </button>
          ) : (
            <button onClick={stopRecording} className="btn-dreamy-danger flex items-center gap-2">
              <StopCircle className="w-4 h-4" /> Stop & Save
            </button>
          )}
        </div>
        {recording && (
          <p className="text-sm text-gray-500">Recording {category} prayer...</p>
        )}
      </div>
      <div className="card-floating p-6 space-y-3">
        {audios.length === 0 ? (
          <p className="text-center text-gray-600">No prayers for this date</p>
        ) : (
          audios.map(a => (
            <div key={a.id} className="flex items-center justify-between bg-gray-50/70 rounded-lg p-3">
              <div>
                <p className="text-gray-800 text-sm font-medium capitalize">{a.category.replace('_', ' ')}</p>
                <p className="text-xs text-gray-500">{dayjs(a.date).format('MMM D, YYYY')}</p>
              </div>
              <button onClick={() => play(a.audio_url)} className="btn-dreamy-secondary flex items-center gap-1">
                <Play className="w-4 h-4" /> Listen
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
