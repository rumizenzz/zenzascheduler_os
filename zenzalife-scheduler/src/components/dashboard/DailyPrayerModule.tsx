import React, { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, DailyPrayer } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Mic, StopCircle } from 'lucide-react'

interface DailyPrayerModuleProps {
  autoStartType?: 'morning' | 'night'
}

function fileToDataURL(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function DailyPrayerModule({ autoStartType }: DailyPrayerModuleProps) {
  const { user } = useAuth()
  const [prayerType, setPrayerType] = useState<'morning' | 'night'>('morning')
  const [recording, setRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [prayers, setPrayers] = useState<DailyPrayer[]>([])
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const fetchPrayers = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('daily_prayers')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
    if (!error && data) setPrayers(data)
  }

  useEffect(() => {
    fetchPrayers()
  }, [user])

  const startRecording = async (type?: 'morning' | 'night') => {
    if (!user) return toast.error('You must be signed in')
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
      setStartTime(new Date())
      setRecording(true)
      if (type) setPrayerType(type)
    } catch (err) {
      toast.error('Failed to start recording')
    }
  }

  const handleStop = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
    try {
      const audioData = await fileToDataURL(audioBlob)
      const fileName = `${prayerType}-prayer-${Date.now()}.webm`
      const { data, error } = await supabase.functions.invoke('audio-upload', {
        body: { audioData, fileName, userId: user!.id }
      })
      if (error || !data?.publicUrl) throw error
      await supabase.from('daily_prayers').insert({
        user_id: user!.id,
        prayer_type: prayerType,
        audio_url: data.publicUrl,
        started_at: startTime?.toISOString()
      })
      toast.success('Prayer saved')
      fetchPrayers()
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setRecording(false)
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
  }

  useEffect(() => {
    if (autoStartType) {
      startRecording(autoStartType)
      const params = new URLSearchParams(window.location.search)
      params.delete('type')
      window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
    }
  }, [autoStartType])

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
        <Mic className="w-8 h-8 text-purple-500" /> Morning & Night Prayers
      </h1>
      <div className="flex items-center gap-3">
        <select
          value={prayerType}
          onChange={e => setPrayerType(e.target.value as 'morning' | 'night')}
          className="input-dreamy"
        >
          <option value="morning">Morning</option>
          <option value="night">Night</option>
        </select>
        {!recording ? (
          <button onClick={() => startRecording()} className="btn-dreamy-primary flex items-center gap-2">
            <Mic className="w-4 h-4" /> Start
          </button>
        ) : (
          <button onClick={stopRecording} className="btn-dreamy-danger flex items-center gap-2">
            <StopCircle className="w-4 h-4" /> Stop & Save
          </button>
        )}
      </div>
      {startTime && recording && (
        <p className="text-sm text-gray-500">Started at {dayjs(startTime).format('h:mm:ss A')}</p>
      )}
      <div className="space-y-2">
        <h2 className="text-xl font-medium text-gray-800">Past Prayers</h2>
        {prayers.map(p => (
          <div key={p.id} className="p-3 bg-white/50 rounded-lg border space-y-1">
            <p className="text-sm text-gray-700 capitalize">
              {p.prayer_type} - {dayjs(p.started_at).format('MMM D, YYYY h:mm A')}
            </p>
            <audio controls src={p.audio_url} className="w-full" />
          </div>
        ))}
        {prayers.length === 0 && (
          <p className="text-sm text-gray-500">No prayers yet.</p>
        )}
      </div>
    </div>
  )
}
