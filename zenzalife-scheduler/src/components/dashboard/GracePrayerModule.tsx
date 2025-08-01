import React, { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, GracePrayer } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Mic, StopCircle } from 'lucide-react'

type MealTime = 'morning' | 'afternoon' | 'evening' | 'night'

function fileToDataURL(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function GracePrayerModule() {
  const { user } = useAuth()
  const [mealTime, setMealTime] = useState<MealTime>('morning')
  const [recording, setRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [prayers, setPrayers] = useState<GracePrayer[]>([])
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const fetchPrayers = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('grace_prayers')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
    if (!error && data) setPrayers(data)
  }

  useEffect(() => {
    fetchPrayers()
  }, [user])

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
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
    try {
      const audioData = await fileToDataURL(audioBlob)
      const fileName = `grace-${mealTime}-${Date.now()}.webm`
      const { data, error } = await supabase.functions.invoke('audio-upload', {
        body: { audioData, fileName, userId: user!.id }
      })
      if (error || !data?.publicUrl) throw error

      let photoUrl: string | null = null
      if (photoFile) {
        const imgData = await fileToDataURL(photoFile)
        const imgRes = await supabase.functions.invoke('image-upload', {
          body: {
            imageData: imgData,
            fileName: `grace-photo-${Date.now()}-${photoFile.name}`,
            userId: user!.id
          }
        })
        if (imgRes.error || !imgRes.data?.publicUrl) throw imgRes.error
        photoUrl = imgRes.data.publicUrl
      }

      await supabase.from('grace_prayers').insert({
        user_id: user!.id,
        meal_time: mealTime,
        audio_url: data.publicUrl,
        photo_url: photoUrl,
        started_at: startTime?.toISOString()
      })
      toast.success('Grace prayer saved')
      fetchPrayers()
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setRecording(false)
      setPhotoFile(null)
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
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={e => setPhotoFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
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
      <div className="space-y-2">
        <h2 className="text-xl font-medium text-gray-800">Past Grace Prayers</h2>
        {prayers.map(p => (
          <div key={p.id} className="p-3 bg-white/50 rounded-lg border space-y-1">
            <p className="text-sm text-gray-700 capitalize">
              {p.meal_time} - {dayjs(p.started_at).format('MMM D, YYYY h:mm A')}
            </p>
            <audio controls src={p.audio_url} className="w-full" />
            {p.photo_url && (
              <button
                onClick={() => window.open(p.photo_url!, '_blank')}
                className="btn-dreamy mt-1 text-sm"
              >
                See Dish
              </button>
            )}
          </div>
        ))}
        {prayers.length === 0 && (
          <p className="text-sm text-gray-500">No grace prayers yet.</p>
        )}
      </div>
    </div>
  )
}
