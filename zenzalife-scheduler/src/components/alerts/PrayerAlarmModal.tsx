import React, { useEffect, useRef, useState } from 'react'
import { Mic, StopCircle, Play } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAudio } from '@/hooks/useAudio'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, PrayerAudio } from '@/lib/supabase'

interface PrayerAlarmModalProps {
  category: 'wake_up' | 'sleep'
  date: string
  soundUrl: string
  onDismiss: () => void
}

export function PrayerAlarmModal({ category, date, soundUrl, onDismiss }: PrayerAlarmModalProps) {
  const { user } = useAuth()
  const { playAudio, stopAudio } = useAudio()
  const [audio, setAudio] = useState<PrayerAudio | null>(null)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [lastDuration, setLastDuration] = useState<number | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const format = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    playAudio(soundUrl, 1, true)
    loadAudio()
    return () => {
      stopAudio()
    }
  }, [soundUrl])

  useEffect(() => {
    if (!recording) return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [recording])

  const loadAudio = async () => {
    if (!user) return
    const { data } = await supabase
      .from('prayer_audios')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .eq('category', category)
      .maybeSingle()
    if (data) setAudio(data as PrayerAudio)
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
      setElapsed(0)
      setLastDuration(null)
      setRecording(true)
    } catch {
      toast.error('Failed to start recording')
    }
  }

  const handleStop = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const duration = elapsed
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
          date,
          category,
          audio_url: data.publicUrl,
          duration
        })
        toast.success('Prayer saved')
        loadAudio()
      } catch (err: any) {
        toast.error('Upload failed: ' + err.message)
      } finally {
        setRecording(false)
        setLastDuration(duration)
      }
    }
    reader.readAsDataURL(blob)
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
  }

  const playPrayer = () => {
    if (audio) playAudio(audio.audio_url, 1, false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-xl shadow-xl p-6 space-y-4 w-80 text-center">
        <h2 className="text-2xl font-semibold text-purple-600">
          {category === 'wake_up' ? 'Morning Prayer' : 'Night Prayer'}
        </h2>
        {audio ? (
          <button onClick={playPrayer} className="btn-dreamy-secondary flex items-center gap-2 mx-auto">
            <Play className="w-4 h-4" /> Start {category === 'wake_up' ? 'Morning' : 'Night'} Prayer
          </button>
        ) : (
          <p className="text-sm text-gray-500">No prayer recorded for today.</p>
        )}
        <div>
          {!recording ? (
            <button onClick={startRecording} className="btn-dreamy-primary flex items-center gap-2 mx-auto">
              <Mic className="w-4 h-4" /> Record My Prayer
            </button>
        ) : (
          <button onClick={stopRecording} className="btn-dreamy-danger flex items-center gap-2 mx-auto">
            <StopCircle className="w-4 h-4" /> Stop & Save
          </button>
        )}
        </div>
        {recording && (
          <p className="text-sm text-gray-500 mt-1">Recording {format(elapsed)}</p>
        )}
        {!recording && lastDuration !== null && (
          <p className="text-sm text-gray-500 mt-1">Recorded {format(lastDuration)}</p>
        )}
        <button onClick={onDismiss} className="btn-dreamy w-full">Close</button>
      </div>
    </div>
  )
}
