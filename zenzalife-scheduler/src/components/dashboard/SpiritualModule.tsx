import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  supabase,
  ScriptureNote,
  ConferenceNote
} from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { BookOpen, Video } from 'lucide-react'

export function SpiritualModule() {
  const { user } = useAuth()
  const [scriptureNotes, setScriptureNotes] = useState<ScriptureNote[]>([])
  const [conferenceNotes, setConferenceNotes] = useState<ConferenceNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showScriptureModal, setShowScriptureModal] = useState(false)
  const [showConferenceModal, setShowConferenceModal] = useState(false)
  const [todayScripture, setTodayScripture] = useState<ScriptureNote | null>(
    null
  )
  const [todayConference, setTodayConference] = useState<ConferenceNote | null>(
    null
  )

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user])

  const loadNotes = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: scriptures } = await supabase
        .from('scripture_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      setScriptureNotes(scriptures || [])
      const today = dayjs().format('YYYY-MM-DD')
      setTodayScripture(scriptures?.find(s => s.date === today) || null)

      const { data: conferences } = await supabase
        .from('conference_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      setConferenceNotes(conferences || [])
      setTodayConference(conferences?.find(c => c.date === today) || null)
    } catch (err: any) {
      toast.error('Failed to load notes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveScripture = async (scripture: string, notes: string) => {
    if (!user) return
    const today = dayjs().format('YYYY-MM-DD')
    const payload = {
      user_id: user.id,
      date: today,
      scripture: scripture.trim(),
      notes: notes.trim() || null,
      updated_at: new Date().toISOString()
    }
    try {
      if (todayScripture) {
        const { error } = await supabase
          .from('scripture_notes')
          .update(payload)
          .eq('id', todayScripture.id)
        if (error) throw error
        toast.success('Scripture updated')
      } else {
        const { error } = await supabase
          .from('scripture_notes')
          .insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
        toast.success('Scripture saved')
      }
      await loadNotes()
      setShowScriptureModal(false)
    } catch (e: any) {
      toast.error('Failed to save scripture: ' + e.message)
    }
  }

  const saveConference = async (
    speaker: string,
    topic: string,
    notes: string
  ) => {
    if (!user) return
    const today = dayjs().format('YYYY-MM-DD')
    const payload = {
      user_id: user.id,
      date: today,
      speaker: speaker.trim(),
      topic: topic.trim() || null,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString()
    }
    try {
      if (todayConference) {
        const { error } = await supabase
          .from('conference_notes')
          .update(payload)
          .eq('id', todayConference.id)
        if (error) throw error
        toast.success('Conference updated')
      } else {
        const { error } = await supabase
          .from('conference_notes')
          .insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
        toast.success('Conference saved')
      }
      await loadNotes()
      setShowConferenceModal(false)
    } catch (e: any) {
      toast.error('Failed to save conference: ' + e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-500" />
            Scripture Study
          </h1>
          <button
            onClick={() => setShowScriptureModal(true)}
            className="btn-dreamy-primary"
          >
            {todayScripture ? 'Update Today' : 'Add Today'}
          </button>
        </div>

        {todayScripture ? (
          <div className="card-floating p-4">
            <h3 className="font-medium text-gray-800 mb-2">
              {todayScripture.scripture}
            </h3>
            {todayScripture.notes && (
              <p className="text-gray-700 whitespace-pre-line">
                {todayScripture.notes}
              </p>
            )}
          </div>
        ) : (
          <div className="card-floating p-4 text-center">
            <p className="text-gray-600">No scripture logged for today</p>
          </div>
        )}

        {scriptureNotes.length > 0 && (
          <div className="card-floating p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Past Scriptures
            </h3>
            <div className="space-y-4">
              {scriptureNotes.map(note => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">
                    {dayjs(note.date).format('MMM D, YYYY')}
                  </div>
                  <h4 className="font-medium text-gray-800">{note.scripture}</h4>
                  {note.notes && (
                    <p className="text-gray-700 mt-1 whitespace-pre-line">
                      {note.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-500" />
            Conferences
          </h1>
          <button
            onClick={() => setShowConferenceModal(true)}
            className="btn-dreamy-primary"
          >
            {todayConference ? 'Update Today' : 'Add Today'}
          </button>
        </div>

        {todayConference ? (
          <div className="card-floating p-4">
            <h3 className="font-medium text-gray-800 mb-1">
              {todayConference.speaker}
              {todayConference.topic ? ` - ${todayConference.topic}` : ''}
            </h3>
            {todayConference.notes && (
              <p className="text-gray-700 whitespace-pre-line">
                {todayConference.notes}
              </p>
            )}
          </div>
        ) : (
          <div className="card-floating p-4 text-center">
            <p className="text-gray-600">No conference logged for today</p>
          </div>
        )}

        {conferenceNotes.length > 0 && (
          <div className="card-floating p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Past Conferences
            </h3>
            <div className="space-y-4">
              {conferenceNotes.map(note => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">
                    {dayjs(note.date).format('MMM D, YYYY')}
                  </div>
                  <h4 className="font-medium text-gray-800">
                    {note.speaker}
                    {note.topic ? ` - ${note.topic}` : ''}
                  </h4>
                  {note.notes && (
                    <p className="text-gray-700 mt-1 whitespace-pre-line">
                      {note.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showScriptureModal && (
        <ScriptureModal
          isOpen={showScriptureModal}
          onClose={() => setShowScriptureModal(false)}
          onSave={saveScripture}
          existing={todayScripture}
        />
      )}

      {showConferenceModal && (
        <ConferenceModal
          isOpen={showConferenceModal}
          onClose={() => setShowConferenceModal(false)}
          onSave={saveConference}
          existing={todayConference}
        />
      )}
    </div>
  )
}

interface ScriptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (scripture: string, notes: string) => void
  existing?: ScriptureNote | null
}

function ScriptureModal({
  isOpen,
  onClose,
  onSave,
  existing
}: ScriptureModalProps) {
  const [scripture, setScripture] = useState(existing?.scripture || '')
  const [notes, setNotes] = useState(existing?.notes || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scripture.trim()) {
      toast.error('Enter scripture reference')
      return
    }
    onSave(scripture, notes)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">
            {existing ? 'Update' : 'Add'} Today's Scripture
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="scriptureRef" className="text-sm font-medium text-gray-700">
              Scripture
            </label>
            <input
              id="scriptureRef"
              value={scripture}
              onChange={e => setScripture(e.target.value)}
              className="input-dreamy w-full"
              placeholder="John 3:16"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="scriptureNotes" className="text-sm font-medium text-gray-700">
              What did you learn?
            </label>
            <textarea
              id="scriptureNotes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-dreamy w-full h-32 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-dreamy">
              Cancel
            </button>
            <button type="submit" className="btn-dreamy-primary">
              {existing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface ConferenceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (speaker: string, topic: string, notes: string) => void
  existing?: ConferenceNote | null
}

function ConferenceModal({
  isOpen,
  onClose,
  onSave,
  existing
}: ConferenceModalProps) {
  const [speaker, setSpeaker] = useState(existing?.speaker || '')
  const [topic, setTopic] = useState(existing?.topic || '')
  const [notes, setNotes] = useState(existing?.notes || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!speaker.trim()) {
      toast.error('Enter a speaker')
      return
    }
    onSave(speaker, topic, notes)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">
            {existing ? 'Update' : 'Add'} Today's Conference
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="confSpeaker" className="text-sm font-medium text-gray-700">
              Speaker
            </label>
            <input
              id="confSpeaker"
              value={speaker}
              onChange={e => setSpeaker(e.target.value)}
              className="input-dreamy w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confTopic" className="text-sm font-medium text-gray-700">
              Topic (optional)
            </label>
            <input
              id="confTopic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="input-dreamy w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confNotes" className="text-sm font-medium text-gray-700">
              What did you learn?
            </label>
            <textarea
              id="confNotes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-dreamy w-full h-32 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-dreamy">
              Cancel
            </button>
            <button type="submit" className="btn-dreamy-primary">
              {existing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

