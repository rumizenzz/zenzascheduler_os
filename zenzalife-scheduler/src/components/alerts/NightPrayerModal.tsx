import React, { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import { toast } from 'react-hot-toast'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface NightPrayerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NightPrayerModal({ isOpen, onClose }: NightPrayerModalProps) {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (recording) {
      timer = setInterval(() => setDuration(d => d + 1), 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [recording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        chunks.current = []
      }
      mediaRecorder.start()
      setRecorder(mediaRecorder)
      setRecording(true)
      setDuration(0)
    } catch (err) {
      console.error('Recording failed', err)
    }
  }

  const stopRecording = () => {
    recorder?.stop()
    recorder?.stream.getTracks().forEach(t => t.stop())
    setRecording(false)
  }

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })

  const handleDone = async () => {
    if (!audioBlob) {
      onClose()
      return
    }

    setUploading(true)
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('Not authenticated')
      const base64Data = await blobToBase64(audioBlob)
      const { data, error } = await supabase.functions.invoke('audio-upload', {
        body: {
          audioData: base64Data,
          fileName: `night-prayer-${Date.now()}.webm`,
          userId: user.id
        }
      })
      if (error) throw error
      const publicUrl = data?.publicUrl
      if (publicUrl) {
        const { error: insertError } = await supabase.from('prayer_recordings').insert({
          user_id: user.id,
          type: 'night',
          date: dayjs().format('YYYY-MM-DD'),
          duration,
          audio_url: publicUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        if (insertError) throw insertError
      }
      toast.success('Night prayer saved')
    } catch (err: any) {
      console.error('Failed to save prayer', err)
      toast.error('Failed to save prayer')
    } finally {
      setUploading(false)
      onClose()
    }
  }

  if (!isOpen) return null

  const mins = String(Math.floor(duration / 60)).padStart(2, '0')
  const secs = String(duration % 60).padStart(2, '0')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-xl shadow-xl p-6 space-y-4 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-blue-700">Night Prayer</h2>
        {!recording && !audioUrl && (
          <button onClick={startRecording} className="btn-dreamy-primary w-full">
            Start Prayer
          </button>
        )}
        {recording && (
          <div className="space-y-3">
            <p className="text-lg font-mono">
              {mins}:{secs}
            </p>
            <button onClick={stopRecording} className="btn-dreamy w-full">
              Stop
            </button>
          </div>
        )}
        {!recording && audioUrl && (
          <div className="space-y-3">
            <audio controls src={audioUrl} className="w-full" />
            <button
              onClick={handleDone}
              disabled={uploading}
              className="btn-dreamy-primary w-full flex items-center justify-center gap-2"
            >
              {uploading && (
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
