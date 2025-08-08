import React, { useState, useRef, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, DailyPrayer } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Mic, StopCircle } from 'lucide-react'

interface DailyPrayerModuleProps {
  autoStartType?: 'morning' | 'night'
}

export function DailyPrayerModule({ autoStartType }: DailyPrayerModuleProps) {
  const { user } = useAuth()
  const [prayerType, setPrayerType] = useState<'morning' | 'night'>('morning')
  const [recording, setRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [lastDuration, setLastDuration] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [prayers, setPrayers] = useState<DailyPrayer[]>([])
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getAudioType = (url: string) => {
    if (url.endsWith('.mp4')) return 'audio/mp4'
    if (url.endsWith('.webm')) return 'audio/webm'
    return 'audio/mpeg'
  }

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })

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
      let options: MediaRecorderOptions | undefined
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' }
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' }
        }
      }
      const recorder = new MediaRecorder(stream, options)
      mediaRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = handleStop
      recorder.start()
      const start = new Date()
      setStartTime(start)
      startTimeRef.current = start
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - start.getTime())
      }, 1000)
      setRecording(true)
      if (type) setPrayerType(type)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording'
      toast.error(message)
    }
  }

  const handleStop = async () => {
    const mimeType = mediaRef.current?.mimeType || 'audio/webm'
    const audioBlob = new Blob(chunksRef.current, { type: mimeType })
    try {
      const extension = mimeType.split(';')[0].split('/')[1]
      const fileName = `${prayerType}-prayer-${Date.now()}.${extension}`
      const audioData = await blobToDataUrl(audioBlob)
      const { data, error: uploadError } = await supabase.functions.invoke('audio-upload', {
        body: { audioData, fileName, userId: user!.id }
      })
      if (uploadError || !data?.data?.publicUrl) {
        throw uploadError || new Error('No URL returned')
      }
      const publicUrl = data.data.publicUrl as string
      const start = startTimeRef.current
      const durationMs = start ? Date.now() - start.getTime() : 0
      const durationSeconds = Math.floor(durationMs / 1000)
      const { error: insertError } = await supabase.from('daily_prayers').insert({
        user_id: user!.id,
        prayer_type: prayerType,
        audio_url: publicUrl,
        started_at: start?.toISOString(),
        duration_seconds: durationSeconds
      })
      if (insertError) throw insertError
      setLastDuration(durationMs)
      toast.success('Prayer saved')
      fetchPrayers()
    } catch (err: any) {
      const message = err && typeof err === 'object' && 'message' in err ? (err as any).message : 'Unknown error'
      toast.error('Upload failed: ' + message)
    } finally {
      mediaRef.current?.stream.getTracks().forEach(t => t.stop())
      mediaRef.current = null
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
      setElapsed(0)
      setRecording(false)
      setStartTime(null)
      startTimeRef.current = null
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

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const parts = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ]
    return parts.join(':')
  }

  const prayersForDate = useMemo(
    () =>
      prayers
        .filter(p => dayjs(p.started_at).isSame(selectedDate, 'day'))
        .sort((a, b) => dayjs(a.started_at).diff(b.started_at)),
    [prayers, selectedDate]
  )

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
      {recording && (
        <p className="text-sm text-gray-500">Duration: {formatDuration(elapsed)}</p>
      )}
      {!recording && lastDuration !== null && (
        <p className="text-sm text-gray-500">You prayed for {formatDuration(lastDuration)}</p>
      )}
      <div className="space-y-2">
        <h2 className="text-xl font-medium text-gray-800">Prayer Calendar</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input-dreamy"
        />
        {prayersForDate.map((p, idx) => (
          <div key={p.id} className="p-3 bg-white/50 rounded-lg border space-y-1">
            <p className="text-sm text-gray-700 capitalize">
              Prayer {idx + 1}: {p.prayer_type} - {dayjs(p.started_at).format('h:mm A')} ({
                formatDuration(p.duration_seconds * 1000)
              })
            </p>
            {p.audio_url ? (
              <audio controls className="w-full">
                <source src={p.audio_url} type={getAudioType(p.audio_url)} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="text-sm text-gray-500">No audio available.</p>
            )}
          </div>
        ))}
        {prayersForDate.length === 0 && (
          <p className="text-sm text-gray-500">No prayers for this date.</p>
        )}
      </div>
    </div>
  )
}
