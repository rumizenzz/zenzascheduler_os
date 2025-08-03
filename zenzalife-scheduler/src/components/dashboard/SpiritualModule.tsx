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
import { BookOpen, Video, Music, Heart, Sparkles, Star } from 'lucide-react'
import { bookOfMormonScriptures } from '@/data/bookOfMormon'

const bibleBooks = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Solomon',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation'
]

const bookOfMormonBooks = [
  '1 Nephi',
  '2 Nephi',
  'Jacob',
  'Enos',
  'Jarom',
  'Omni',
  'Words of Mormon',
  'Mosiah',
  'Alma',
  'Helaman',
  '3 Nephi',
  '4 Nephi',
  'Mormon',
  'Ether',
  'Moroni'
]

function validateReference(ref: string, book: string): string | null {
  const match = ref.trim().match(/^(.+?)\s+\d+:\d+/)
  if (!match) {
    return 'Enter verse as Book Chapter:Verse (e.g. John 3:16)'
  }
  const bookName = match[1].trim().toLowerCase()
  if (book === 'The Bible') {
    if (!bibleBooks.some(b => b.toLowerCase() === bookName)) {
      return 'This reference is not in the Bible. Try something like "John 3:16".'
    }
  } else if (book === 'Book of Mormon') {
    if (!bookOfMormonBooks.some(b => b.toLowerCase() === bookName)) {
      return 'This reference is not in the Book of Mormon. Try "1 Nephi 3:7".'
    }
  } else if (book === 'Doctrine and Covenants') {
    if (bookName !== 'd&c' && bookName !== 'doctrine and covenants') {
      return 'Use a Doctrine and Covenants format like "D&C 1:6".'
    }
  }
  return null
}

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
  const [todayScriptures, setTodayScriptures] = useState<ScriptureNote[]>([])
  const [editingScripture, setEditingScripture] = useState<ScriptureNote | null>(
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
      setTodayScriptures((scriptures || []).filter(s => s.date === today))

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
    version: string,
    id?: string
  ) => {
    if (!user || !isOwnNotes) return
    const today = dayjs().format('YYYY-MM-DD')
    const payload = {
      user_id: user.id,
      date: id && editingScripture ? editingScripture.date : today,
      scripture: scripture.trim(),
      book: book.trim() || null,
      version: version.trim() || null,
      full_text: fullText.trim() || null,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString()
    }
    try {
      if (id) {
        const { error } = await supabase
          .from('scripture_notes')
          .update(payload)
          .eq('id', id)
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
      setEditingScripture(null)
    } catch (e: any) {
      toast.error('Failed to save scripture: ' + e.message)
    }
  }

  const toggleFavoriteScripture = async (
    noteId: string,
    isFavorite: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('scripture_notes')
        .update({ is_favorite: !isFavorite, updated_at: new Date().toISOString() })
        .eq('id', noteId)
      if (error) throw error
      setScriptureNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, is_favorite: !isFavorite } : n))
      )
      setTodayScriptures((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, is_favorite: !isFavorite } : n))
      )
      toast.success(!isFavorite ? 'Marked favorite' : 'Removed favorite')
    } catch (e: any) {
      toast.error('Failed to update favorite: ' + e.message)
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
                  onClick={() => {
                    setEditingScripture(null)
                    setShowScriptureModal(true)
                  }}
                  className="btn-dreamy-primary"
                >
                  Add Verse Entry
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

        {todayScriptures.length > 0 ? (
          <div className="space-y-4">
            {todayScriptures.map(note => (
              <div key={note.id} className="card-floating p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-gray-800">
                    {note.scripture}
                    {note.version
                      ? ` (${note.version})`
                      : note.book
                      ? ` (${note.book})`
                      : ''}
                  </h3>
                  {isOwnNotes && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavoriteScripture(note.id, note.is_favorite || false)}
                        className={`p-1 rounded-full transition-colors ${
                          note.is_favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${note.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingScripture(note)
                          setShowScriptureModal(true)
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit Verse Entry
                      </button>
                    </div>
                  )}
                </div>
                {note.full_text && (
                  <blockquote className="scripture-scroll whitespace-pre-line">
                    {note.full_text}
                  </blockquote>
                )}
                {note.notes && (
                  <p className="text-gray-700 whitespace-pre-line">
                    <span className="font-medium">What did you learn today:</span>{' '}
                    {note.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card-floating p-4 text-center">
            <p className="text-gray-600">No scripture logged for today</p>
          </div>
        )}

        {scriptureNotes.filter(n => n.date !== dayjs().format('YYYY-MM-DD')).length > 0 && (
          <div className="card-floating p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Past Scriptures
            </h3>
            <div className="space-y-4">
              {scriptureNotes
                .filter(n => n.date !== dayjs().format('YYYY-MM-DD'))
                .map(note => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        {dayjs(note.date).format('MMM D, YYYY')}
                      </span>
                      {isOwnNotes && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavoriteScripture(note.id, note.is_favorite || false)}
                            className={`p-1 rounded-full transition-colors ${
                              note.is_favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${note.is_favorite ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingScripture(note)
                              setShowScriptureModal(true)
                            }}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Edit Verse Entry
                          </button>
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-800">
                      {note.scripture}
                      {note.version ? ` (${note.version})` : note.book ? ` (${note.book})` : ''}
                    </h4>
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
          onClose={() => {
            setShowScriptureModal(false)
            setEditingScripture(null)
          }}
          onSave={saveScripture}
          existing={editingScripture}
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
    version: string,
    id?: string
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

  const fetchBibleVerse = async (ref: string, ver: string) => {
    if (!ref.trim() || validateReference(ref, 'The Bible')) return
    try {
      const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=${
        ver || 'kjv'
      }`
      const res = await fetch(url)
      const data = await res.json()
      if (data.text) {
        setFullText(data.text.trim())
      }
    } catch {
      /* ignore errors */
    }
  }

  useEffect(() => {
    if (book !== 'The Bible') {
      setVersion('')
    }
    if (book === 'The Bible' && scripture && !validateReference(scripture, 'The Bible')) {
      void fetchBibleVerse(scripture, version)
    }
  }, [book])

  useEffect(() => {
    if (book === 'The Bible' && scripture && !validateReference(scripture, 'The Bible')) {
      void fetchBibleVerse(scripture, version)
    }
  }, [version])

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
    if (book !== 'Other') {
      const err = validateReference(scripture, book)
      if (err) {
        toast.error(err)
        return
      }
    }
    onSave(
      scripture,
      fullText,
      notes,
      book === 'Other' ? customBook : book,
      version,
      existing?.id
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">
            {existing ? 'Edit' : 'Add'} Verse Entry
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
                onChange={e => {
                  const val = e.target.value
                  setScripture(val)
                  if (book === 'The Bible') {
                    if (!validateReference(val, 'The Bible')) {
                      void fetchBibleVerse(val, version)
                    }
                  } else if (book === 'Book of Mormon') {
                    const match = bookOfMormonScriptures.find(s => s.reference === val)
                    if (match) setFullText(match.text)
                  }
                }}
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
  const [hymnKey, setHymnKey] = useState('')
  const [lyrics, setLyrics] = useState<string[]>([])
  const [hymns, setHymns] = useState<Record<string, { label: string; lyrics: string[] }> | null>(null)
  const [loadingHymns, setLoadingHymns] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          'https://raw.githubusercontent.com/ldsdevs/hymns-with-lyrics/main/json/hymns-es.json'
        )
        const data = await res.json()
        setHymns(data)
        if (existing?.hymn) {
          const found = Object.entries(data).find(([, v]) => v.label === existing.hymn)
          if (found) {
            setHymnKey(found[0])
            setLyrics(found[1].lyrics || [])
          }
        }
      } catch {
        setHymns(null)
      } finally {
        setLoadingHymns(false)
      }
    }
    load()
  }, [existing])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hymn.trim()) {
      toast.error('Enter a hymn')
      return
    }
    onSave(hymn, feeling)
  }

  const handleSelect = (key: string) => {
    if (!hymns) return
    const entry = hymns[key]
    setHymnKey(key)
    setHymn(entry.label)
    setLyrics(entry.lyrics || [])
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
            {loadingHymns ? (
              <p>Loading hymns...</p>
            ) : hymns ? (
              <select
                id="hymnTitle"
                value={hymnKey}
                onChange={e => handleSelect(e.target.value)}
                className="input-dreamy w-full"
                required
              >
                <option value="">Select hymn</option>
                {Object.entries(hymns).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="hymnTitle"
                value={hymn}
                onChange={e => setHymn(e.target.value)}
                className="input-dreamy w-full"
                required
              />
            )}
          </div>
          {lyrics.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-xl max-h-60 overflow-y-auto whitespace-pre-line text-sm">
              {lyrics.join('\n')}
            </div>
          )}
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

