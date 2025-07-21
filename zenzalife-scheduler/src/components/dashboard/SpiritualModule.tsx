import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  supabase,
  ScriptureNote,
  ConferenceNote,
  HymnNote,
  GratitudeNote,
  DiscipleshipNote,
  User
} from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { BookOpen, Video, Music, Heart, Sparkles } from 'lucide-react'
import { bookOfMormonScriptures } from '@/data/bookOfMormon'

interface FamilySelectModalProps {
  isOpen: boolean
  onClose: () => void
  members: User[]
  onSelect: (member: User) => void
}

function FamilySelectModal({ isOpen, onClose, members, onSelect }: FamilySelectModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-light text-gray-800">Select Family Member</h2>
          <ul className="space-y-2">
            {members.map(m => (
              <li key={m.id}>
                <button
                  onClick={() => onSelect(m)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  {m.display_name}
                </button>
              </li>
            ))}
          </ul>
          <div className="text-right pt-2">
            <button onClick={onClose} className="btn-dreamy">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SpiritualModule() {
  const { user, profile } = useAuth()
  const [scriptureNotes, setScriptureNotes] = useState<ScriptureNote[]>([])
  const [conferenceNotes, setConferenceNotes] = useState<ConferenceNote[]>([])
  const [hymnNotes, setHymnNotes] = useState<HymnNote[]>([])
  const [gratitudeNotes, setGratitudeNotes] = useState<GratitudeNote[]>([])
  const [discipleshipNotes, setDiscipleshipNotes] = useState<DiscipleshipNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showScriptureModal, setShowScriptureModal] = useState(false)
  const [showConferenceModal, setShowConferenceModal] = useState(false)
  const [showHymnModal, setShowHymnModal] = useState(false)
  const [showGratitudeModal, setShowGratitudeModal] = useState(false)
  const [showDiscipleshipModal, setShowDiscipleshipModal] = useState(false)
  const [todayScripture, setTodayScripture] = useState<ScriptureNote | null>(
    null
  )
  const [todayConference, setTodayConference] = useState<ConferenceNote | null>(
    null
  )
  const [todayHymn, setTodayHymn] = useState<HymnNote | null>(null)
  const [todayGratitude, setTodayGratitude] = useState<GratitudeNote | null>(
    null
  )
  const [todayDiscipleship, setTodayDiscipleship] = useState<DiscipleshipNote | null>(
    null
  )
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [familyMembers, setFamilyMembers] = useState<User[]>([])
  const [showFamilySelect, setShowFamilySelect] = useState(false)
  const isOwnNotes = !viewUser || viewUser.id === user?.id

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user, viewUser])

  useEffect(() => {
    if (profile?.family_id) {
      loadFamilyMembers()
    }
  }, [profile?.family_id])

  const loadNotes = async () => {
    if (!user) return
    const targetId = viewUser ? viewUser.id : user.id
    setLoading(true)
    try {
      const { data: scriptures } = await supabase
        .from('scripture_notes')
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false })
      setScriptureNotes(scriptures || [])
      const today = dayjs().format('YYYY-MM-DD')
      setTodayScripture(scriptures?.find(s => s.date === today) || null)

      const { data: conferences } = await supabase
        .from('conference_notes')
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false })
      setConferenceNotes(conferences || [])
      setTodayConference(conferences?.find(c => c.date === today) || null)

      const { data: hymns } = await supabase
        .from('hymn_notes')
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false })
      setHymnNotes(hymns || [])
      setTodayHymn(hymns?.find(h => h.date === today) || null)

      const { data: gratitude } = await supabase
        .from('gratitude_notes')
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false })
      setGratitudeNotes(gratitude || [])
      setTodayGratitude(gratitude?.find(g => g.date === today) || null)

      const { data: discipleship } = await supabase
        .from('discipleship_notes')
        .select('*')
        .eq('user_id', targetId)
        .order('date', { ascending: false })
      setDiscipleshipNotes(discipleship || [])
      setTodayDiscipleship(discipleship?.find(d => d.date === today) || null)
    } catch (err: any) {
      toast.error('Failed to load notes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFamilyMembers = async () => {
    if (!profile?.family_id) return
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: true })
      if (error) throw error
      setFamilyMembers(data || [])
    } catch (err: any) {
      toast.error('Failed to load family members: ' + err.message)
    }
  }

  const saveScripture = async (
    scripture: string,
    fullText: string,
    notes: string,
    book: string,
    version: string
  ) => {
    if (!user || !isOwnNotes) return
    const today = dayjs().format('YYYY-MM-DD')
    const payload = {
      user_id: user.id,
      date: today,
      scripture: scripture.trim(),
      book: book.trim() || null,
      version: version.trim() || null,
      full_text: fullText.trim() || null,
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
    if (!user || !isOwnNotes) return
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

  const saveHymn = async (hymn: string, feeling: string) => {
    if (!user || !isOwnNotes) return
    const today = dayjs().format('YYYY-MM-DD')
    const payload = {
      user_id: user.id,
      date: today,
      hymn: hymn.trim(),
      feeling: feeling.trim() || null,
      updated_at: new Date().toISOString()
    }
    try {
      if (todayHymn) {
        const { error } = await supabase
          .from('hymn_notes')
          .update(payload)
          .eq('id', todayHymn.id)
        if (error) throw error
        toast.success('Hymn updated')
      } else {
        const { error } = await supabase
          .from('hymn_notes')
          .insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
        toast.success('Hymn saved')
      }
      await loadNotes()
      setShowHymnModal(false)
    } catch (e: any) {
      toast.error('Failed to save hymn: ' + e.message)
    }
  }

  const saveGratitude = async (content: string) => {
    if (!user || !isOwnNotes) return
    const today = dayjs().format('YYYY-MM-DD')
    const payload = {
      user_id: user.id,
      date: today,
      content: content.trim(),
      updated_at: new Date().toISOString()
    }
    try {
      if (todayGratitude) {
        const { error } = await supabase
          .from('gratitude_notes')
          .update(payload)
          .eq('id', todayGratitude.id)
        if (error) throw error
        toast.success('Gratitude updated')
      } else {
        const { error } = await supabase
          .from('gratitude_notes')
          .insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
        toast.success('Gratitude saved')
      }
      await loadNotes()
      setShowGratitudeModal(false)
    } catch (e: any) {
      toast.error('Failed to save gratitude: ' + e.message)
    }
  }

  const saveDiscipleship = async (content: string) => {
    if (!user || !isOwnNotes) return
    const today = dayjs().format('YYYY-MM-DD')
    const payload = {
      user_id: user.id,
      date: today,
      content: content.trim(),
      updated_at: new Date().toISOString()
    }
    try {
      if (todayDiscipleship) {
        const { error } = await supabase
          .from('discipleship_notes')
          .update(payload)
          .eq('id', todayDiscipleship.id)
        if (error) throw error
        toast.success('Reflection updated')
      } else {
        const { error } = await supabase
          .from('discipleship_notes')
          .insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
        toast.success('Reflection saved')
      }
      await loadNotes()
      setShowDiscipleshipModal(false)
    } catch (e: any) {
      toast.error('Failed to save reflection: ' + e.message)
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
            {isOwnNotes ? 'Scripture Study' : `${viewUser?.display_name}'s Scriptures`}
          </h1>
          <div className="flex gap-3">
            {isOwnNotes ? (
              <>
                <button
                  onClick={() => setShowScriptureModal(true)}
                  className="btn-dreamy-primary"
                >
                  {todayScripture ? 'Update Today' : 'Add Today'}
                </button>
                <button
                  onClick={() => setShowFamilySelect(true)}
                  className="btn-dreamy"
                >
                  See Family Member's Scriptures
                </button>
              </>
            ) : (
              <button onClick={() => setViewUser(null)} className="btn-dreamy">
                Back to Your Scriptures
              </button>
            )}
          </div>
        </div>

        {todayScripture ? (
          <div className="card-floating p-4 space-y-4">
            <h3 className="font-medium text-gray-800">{todayScripture.scripture}</h3>
            {todayScripture.full_text && (
              <blockquote className="scripture-scroll whitespace-pre-line">
                {todayScripture.full_text}
              </blockquote>
            )}
            {todayScripture.notes && (
              <p className="text-gray-700 whitespace-pre-line">
                <span className="font-medium">What did you learn today:</span>{' '}
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
                  {note.full_text && (
                    <blockquote className="scripture-scroll mt-2 whitespace-pre-line">
                      {note.full_text}
                    </blockquote>
                  )}
                  {note.notes && (
                    <p className="text-gray-700 mt-1 whitespace-pre-line">
                      <span className="font-medium">What did you learn:</span>{' '}
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
                <span className="font-medium">What did you learn today:</span>{' '}
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
                      <span className="font-medium">What did you learn:</span>{' '}
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
            <Music className="w-8 h-8 text-green-500" />
            Hymns Sung
          </h1>
          <button onClick={() => setShowHymnModal(true)} className="btn-dreamy-primary">
            {todayHymn ? 'Update Today' : 'Add Today'}
          </button>
        </div>

        {todayHymn ? (
          <div className="card-floating p-4">
            <h3 className="font-medium text-gray-800 mb-1">{todayHymn.hymn}</h3>
            {todayHymn.feeling && (
              <p className="text-gray-700 whitespace-pre-line">{todayHymn.feeling}</p>
            )}
          </div>
        ) : (
          <div className="card-floating p-4 text-center">
            <p className="text-gray-600">No hymn logged for today</p>
          </div>
        )}

        {hymnNotes.length > 0 && (
          <div className="card-floating p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Past Hymns</h3>
            <div className="space-y-4">
              {hymnNotes.map(note => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">
                    {dayjs(note.date).format('MMM D, YYYY')}
                  </div>
                  <h4 className="font-medium text-gray-800">{note.hymn}</h4>
                  {note.feeling && (
                    <p className="text-gray-700 mt-1 whitespace-pre-line">{note.feeling}</p>
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
            <Heart className="w-8 h-8 text-red-500" />
            Gratitude
          </h1>
          <button onClick={() => setShowGratitudeModal(true)} className="btn-dreamy-primary">
            {todayGratitude ? 'Update Today' : 'Add Today'}
          </button>
        </div>

        {todayGratitude ? (
          <div className="card-floating p-4">
            <p className="text-gray-700 whitespace-pre-line">{todayGratitude.content}</p>
          </div>
        ) : (
          <div className="card-floating p-4 text-center">
            <p className="text-gray-600">No gratitude logged for today</p>
          </div>
        )}

      {gratitudeNotes.length > 0 && (
        <div className="card-floating p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Past Gratitude</h3>
          <div className="space-y-4">
            {gratitudeNotes.map(note => (
              <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">
                  {dayjs(note.date).format('MMM D, YYYY')}
                </div>
                <p className="text-gray-700">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-gray-800 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          What am I doing to become more like Jesus today?
        </h1>
        <button onClick={() => setShowDiscipleshipModal(true)} className="btn-dreamy-primary">
          {todayDiscipleship ? 'Update Today' : 'Add Today'}
        </button>
      </div>

      {todayDiscipleship ? (
        <div className="card-floating p-4">
          <p className="text-gray-700 whitespace-pre-line">{todayDiscipleship.content}</p>
        </div>
      ) : (
        <div className="card-floating p-4 text-center">
          <p className="text-gray-600">No reflection logged for today</p>
        </div>
      )}

      {discipleshipNotes.length > 0 && (
        <div className="card-floating p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Past Reflections</h3>
          <div className="space-y-4">
            {discipleshipNotes.map(note => (
              <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">
                  {dayjs(note.date).format('MMM D, YYYY')}
                </div>
                <p className="text-gray-700">{note.content}</p>
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

      {showHymnModal && (
        <HymnModal
          isOpen={showHymnModal}
          onClose={() => setShowHymnModal(false)}
          onSave={saveHymn}
          existing={todayHymn}
        />
      )}

      {showGratitudeModal && (
        <GratitudeModal
          isOpen={showGratitudeModal}
          onClose={() => setShowGratitudeModal(false)}
          onSave={saveGratitude}
          existing={todayGratitude}
        />
      )}

      {showDiscipleshipModal && (
        <DiscipleshipModal
          isOpen={showDiscipleshipModal}
          onClose={() => setShowDiscipleshipModal(false)}
          onSave={saveDiscipleship}
          existing={todayDiscipleship}
        />
      )}

      {showFamilySelect && (
        <FamilySelectModal
          isOpen={showFamilySelect}
          onClose={() => setShowFamilySelect(false)}
          members={familyMembers.filter(m => m.id !== user?.id)}
          onSelect={member => {
            setViewUser(member)
            setShowFamilySelect(false)
          }}
        />
      )}
    </div>
  )
}

interface ScriptureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    scripture: string,
    fullText: string,
    notes: string,
    book: string,
    version: string
  ) => void
  existing?: ScriptureNote | null
}

function ScriptureModal({
  isOpen,
  onClose,
  onSave,
  existing
}: ScriptureModalProps) {
  const [scripture, setScripture] = useState(existing?.scripture || '')
  const [fullText, setFullText] = useState(existing?.full_text || '')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [book, setBook] = useState(existing?.book || 'The Bible')
  const [customBook, setCustomBook] = useState('')
  const [version, setVersion] = useState(existing?.version || '')
  const [useCustomRef, setUseCustomRef] = useState(book !== 'Book of Mormon')

  useEffect(() => {
    if (book !== 'The Bible') {
      setVersion('')
    }
  }, [book])

  const bookOptions = [
    'The Bible',
    'Book of Mormon',
    'Doctrine and Covenants',
    'Pearl of Great Price',
    'Other'
  ]
  const versionOptions = ['KJV', 'NKJV', 'NIV', 'ESV', 'NASB']

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scripture.trim()) {
      toast.error('Enter scripture reference')
      return
    }
    if (book === 'Other' && !customBook.trim()) {
      toast.error('Enter book name')
      return
    }
    onSave(scripture, fullText, notes, book === 'Other' ? customBook : book, version)
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
            <label htmlFor="scriptureBook" className="text-sm font-medium text-gray-700">
              Book
            </label>
            <select
              id="scriptureBook"
              value={book}
              onChange={e => {
                const newBook = e.target.value
                setBook(newBook)
                setUseCustomRef(newBook !== 'Book of Mormon')
              }}
              className="input-dreamy w-full"
            >
              {bookOptions.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {book === 'Other' && (
              <input
                className="input-dreamy w-full mt-2"
                value={customBook}
                onChange={e => setCustomBook(e.target.value)}
                placeholder="Enter book name"
              />
            )}
          </div>

          {book === 'The Bible' && (
            <div className="space-y-2">
              <label htmlFor="scriptureVersion" className="text-sm font-medium text-gray-700">
                Version
              </label>
              <select
                id="scriptureVersion"
                value={version}
                onChange={e => setVersion(e.target.value)}
                className="input-dreamy w-full"
              >
                <option value="">Select version</option>
                {versionOptions.map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="scriptureRef" className="text-sm font-medium text-gray-700">
              Scripture Reference
            </label>
            {book === 'Book of Mormon' && !useCustomRef ? (
              <select
                id="scriptureRef"
                value={scripture}
                onChange={e => {
                  if (e.target.value === '__custom__') {
                    setUseCustomRef(true)
                    setScripture('')
                  } else {
                    setScripture(e.target.value)
                    const match = bookOfMormonScriptures.find(s => s.reference === e.target.value)
                    if (match) setFullText(match.text)
                  }
                }}
                className="input-dreamy w-full"
              >
                <option value="">Select reference</option>
                {bookOfMormonScriptures.map(s => (
                  <option key={s.reference} value={s.reference}>
                    {s.reference}
                  </option>
                ))}
                <option value="__custom__">Other...</option>
              </select>
            ) : (
              <input
                id="scriptureRef"
                value={scripture}
                onChange={e => setScripture(e.target.value)}
                className="input-dreamy w-full"
                placeholder="John 3:16"
                required
              />
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="scriptureText" className="text-sm font-medium text-gray-700">
              Full Scripture Text
            </label>
            <textarea
              id="scriptureText"
              value={fullText}
              onChange={e => setFullText(e.target.value)}
              className="input-dreamy w-full h-32 resize-none"
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

interface HymnModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (hymn: string, feeling: string) => void
  existing?: HymnNote | null
}

function HymnModal({ isOpen, onClose, onSave, existing }: HymnModalProps) {
  const [hymn, setHymn] = useState(existing?.hymn || '')
  const [feeling, setFeeling] = useState(existing?.feeling || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hymn.trim()) {
      toast.error('Enter a hymn')
      return
    }
    onSave(hymn, feeling)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">
            {existing ? 'Update' : 'Add'} Today's Hymn
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="hymnTitle" className="text-sm font-medium text-gray-700">
              Hymn
            </label>
            <input
              id="hymnTitle"
              value={hymn}
              onChange={e => setHymn(e.target.value)}
              className="input-dreamy w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hymnFeeling" className="text-sm font-medium text-gray-700">
              How did it make you feel?
            </label>
            <textarea
              id="hymnFeeling"
              value={feeling}
              onChange={e => setFeeling(e.target.value)}
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

interface GratitudeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string) => void
  existing?: GratitudeNote | null
}

function GratitudeModal({ isOpen, onClose, onSave, existing }: GratitudeModalProps) {
  const [content, setContent] = useState(existing?.content || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Enter what you are grateful for')
      return
    }
    onSave(content)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">
            {existing ? 'Update' : 'Add'} Gratitude
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="gratitudeContent" className="text-sm font-medium text-gray-700">
              What are you grateful for?
            </label>
            <textarea
              id="gratitudeContent"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="input-dreamy w-full h-32 resize-none"
              required
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

interface DiscipleshipModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string) => void
  existing?: DiscipleshipNote | null
}

function DiscipleshipModal({ isOpen, onClose, onSave, existing }: DiscipleshipModalProps) {
  const [content, setContent] = useState(existing?.content || '')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Enter your reflection')
      return
    }
    onSave(content)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">
            {existing ? 'Update' : 'Add'} Reflection
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="discipleshipContent" className="text-sm font-medium text-gray-700">
              How are you becoming more like Jesus today?
            </label>
            <textarea
              id="discipleshipContent"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="input-dreamy w-full h-32 resize-none"
              required
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

