import React, { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, GracePrayer } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Mic, StopCircle, Play, Camera } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'

type MealTime = 'morning' | 'afternoon' | 'evening' | 'night'

export function GracePrayerModule() {
  const { user } = useAuth()
  const { playAudio } = useAudio()
  const [mealTime, setMealTime] = useState<MealTime>('morning')
  const [recording, setRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format('YYYY-MM-DD')
  )
  const [audios, setAudios] = useState<GracePrayer[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (user) loadAudios()
  }, [user, selectedDate])

  const loadAudios = async () => {
    if (!user) return
    const start = dayjs(selectedDate).startOf('day').toISOString()
    const end = dayjs(selectedDate).endOf('day').toISOString()
    const { data, error } = await supabase
      .from('grace_prayers')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', start)
      .lte('started_at', end)
      .order('meal_time')
    if (error) {
      toast.error('Failed to load prayers')
      return
    }
    setAudios(data || [])
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

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
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string
        const fileName = `grace-${mealTime}-${Date.now()}.webm`
        const { data, error } = await supabase.functions.invoke('audio-upload', {
          body: { audioData: base64Data, fileName, userId: user!.id }
        })
        if (error || !data?.publicUrl) throw error
        let photoUrl: string | undefined
        if (photoFile) {
          const imgName = `meal-photos/${user!.id}/${Date.now()}-${photoFile.name}`
          const { data: imgData, error: imgError } = await supabase.storage
            .from('zenzalife-assets')
            .upload(imgName, photoFile, { contentType: photoFile.type })
          if (imgError) {
            throw imgError
          }
          photoUrl = supabase.storage
            .from('zenzalife-assets')
            .getPublicUrl(imgData.path).data.publicUrl
        }
        await supabase.from('grace_prayers').insert({
          user_id: user!.id,
          meal_time: mealTime,
          audio_url: data.publicUrl,
          meal_photo_url: photoUrl,
          started_at: startTime?.toISOString()
        })
        toast.success('Grace prayer saved')
        loadAudios()
      } catch (err: any) {
        toast.error('Upload failed: ' + err.message)
      } finally {
        setPhotoFile(null)
        setPhotoPreview(null)
        setRecording(false)
      }
    }
    reader.readAsDataURL(blob)
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
          <Mic className="w-8 h-8 text-purple-500" /> Grace Prayer
        </h1>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input-dreamy"
        />
      </div>
      <div className="card-floating p-6 space-y-3">
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
            <button
              onClick={startRecording}
              className="btn-dreamy-primary flex items-center gap-2"
            >
              <Mic className="w-4 h-4" /> Start
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="btn-dreamy-danger flex items-center gap-2"
            >
              <StopCircle className="w-4 h-4" /> Stop & Save
            </button>
          )}
          <label htmlFor="meal-photo" className="btn-dreamy-secondary flex items-center gap-2">
            <Camera className="w-4 h-4" /> Photo
          </label>
          <input
            id="meal-photo"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
        {startTime && recording && (
          <p className="text-sm text-gray-500">
            Started at {dayjs(startTime).format('h:mm:ss A')}
          </p>
        )}
        {photoPreview && (
          <img src={photoPreview} alt="meal preview" className="w-24 h-24 object-cover rounded-lg mt-2" />
        )}
      </div>
      <div className="card-floating p-6 space-y-3">
        {audios.length === 0 ? (
          <p className="text-center text-gray-600">No prayers for this date</p>
        ) : (
          audios.map(a => (
            <div
              key={a.id}
              className="flex items-center justify-between bg-gray-50/70 rounded-lg p-3"
            >
              <div>
                <p className="text-gray-800 text-sm font-medium capitalize">
                  {a.meal_time}
                </p>
                <p className="text-xs text-gray-500">
                  {dayjs(a.started_at).format('h:mm A')}
                </p>
              </div>
              {a.meal_photo_url && (
                <img
                  src={a.meal_photo_url}
                  alt="meal"
                  className="w-12 h-12 rounded-lg object-cover mr-2"
                />
              )}
              <button
                onClick={() => playAudio(a.audio_url)}
                className="btn-dreamy-secondary flex items-center gap-1"
              >
                <Play className="w-4 h-4" /> Listen
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
