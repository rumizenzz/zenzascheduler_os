import React, { useState, useRef } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, GRACE_PRAYER_BUCKET } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Mic, StopCircle } from 'lucide-react'

type MealTime = 'morning' | 'afternoon' | 'evening' | 'night'

export function GracePrayerModule() {
  const { user } = useAuth()
  const [mealTime, setMealTime] = useState<MealTime>('morning')
  const [recording, setRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
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
    } catch (err) {
      toast.error('Failed to start recording')
    }
  }

  const handleStop = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const filePath = `${user!.id}/grace-${mealTime}-${Date.now()}.webm`
    try {
      const { error: uploadError } = await supabase.storage
        .from(GRACE_PRAYER_BUCKET)
        .upload(filePath, blob, { upsert: true, contentType: 'audio/webm' })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(GRACE_PRAYER_BUCKET)
        .getPublicUrl(filePath)

      await supabase.from('grace_prayers').insert({
        user_id: user!.id,
        meal_time: mealTime,
        audio_url: urlData.publicUrl,
        started_at: startTime?.toISOString()
      })
      toast.success('Grace prayer saved')
    } catch (err: any) {
      const message = err instanceof Error && err.message ? err.message : 'Unknown error'
      toast.error(`Upload failed: ${message}`)
    } finally {
      setRecording(false)
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
        <Mic className="w-8 h-8 text-purple-500" /> Grace Prayer
      </h1>
      <div className="flex items-center gap-3">
        <select
          value={mealTime}
          onChange={e => setMealTime(e.target.value as MealTime)}
          className="input-dreamy"
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
        </select>
        {!recording ? (
          <button onClick={startRecording} className="btn-dreamy-primary flex items-center gap-2">
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
    </div>
  )
}
