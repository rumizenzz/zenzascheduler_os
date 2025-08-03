import React, { useState, useEffect } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { bookOfMormonScriptures } from '@/data/bookOfMormon'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

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

export function ReadVerse() {
  const [source, setSource] = useState<'bom' | 'bible'>('bom')
  const [bomIndex, setBomIndex] = useState(0)
  const [bibleBook, setBibleBook] = useState('John')
  const [chapter, setChapter] = useState(1)
  const [verseNumber, setVerseNumber] = useState(1)
  const [reference, setReference] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [notes, setNotes] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchVerse()
  }, [source, bomIndex, bibleBook, chapter, verseNumber])

  const fetchVerse = async () => {
    setLoading(true)
    setSavedId(null)
    setIsFavorite(false)
    setNotes('')
    try {
      if (source === 'bom') {
        const v = bookOfMormonScriptures[bomIndex]
        if (v) {
          setReference(v.reference)
          setText(v.text)
        } else {
          setReference('')
          setText('No verse found')
        }
      } else {
        const ref = `${bibleBook} ${chapter}:${verseNumber}`
        const url = `https://bible-api.com/${encodeURIComponent(ref)}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.text) {
          setReference(data.reference)
          setText(data.text.trim())
        } else {
          setReference(ref)
          setText('No verse found')
        }
      }
    } catch {
      setReference('')
      setText('Failed to fetch verse')
    } finally {
      setLoading(false)
    }
  }

  const nextVerse = () => {
    if (source === 'bom') {
      setBomIndex((i) => (i + 1) % bookOfMormonScriptures.length)
    } else {
      setVerseNumber((v) => v + 1)
    }
  }

  const prevVerse = () => {
    if (source === 'bom') {
      setBomIndex((i) => (i - 1 + bookOfMormonScriptures.length) % bookOfMormonScriptures.length)
    } else {
      setVerseNumber((v) => Math.max(1, v - 1))
    }
  }

  const saveVerse = async () => {
    if (!user || !reference) return
    const today = new Date().toISOString().slice(0, 10)
    const payload = {
      user_id: user.id,
      date: today,
      scripture: reference,
      book: source === 'bom' ? 'Book of Mormon' : 'Bible',
      version: null,
      full_text: text,
      notes: notes.trim() || null,
      is_favorite: isFavorite,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    try {
      const { data, error } = await supabase
        .from('scripture_notes')
        .insert(payload)
        .select('id')
        .maybeSingle()
      if (error) throw error
      if (data) setSavedId(data.id)
      toast.success('Verse saved to Spiritual Study')
    } catch (e: any) {
      toast.error('Failed to save verse: ' + e.message)
    }
  }

  const toggleFavorite = async () => {
    if (!user || !savedId) return
    const newFav = !isFavorite
    try {
      const { error } = await supabase
        .from('scripture_notes')
        .update({ is_favorite: newFav, updated_at: new Date().toISOString() })
        .eq('id', savedId)
      if (error) throw error
      setIsFavorite(newFav)
      toast.success(newFav ? 'Marked favorite' : 'Removed favorite')
    } catch (e: any) {
      toast.error('Failed to update favorite: ' + e.message)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2">
        <BookOpen className="w-5 h-5" /> Read Verse
      </h2>
      <div className="flex flex-wrap gap-3 items-end">
        <select
          className="input-dreamy"
          value={source}
          onChange={(e) => setSource(e.target.value as 'bom' | 'bible')}
        >
          <option value="bom">Book of Mormon</option>
          <option value="bible">Bible</option>
        </select>
        {source === 'bible' && (
          <>
            <select
              className="input-dreamy"
              value={bibleBook}
              onChange={(e) => {
                setBibleBook(e.target.value)
                setChapter(1)
                setVerseNumber(1)
              }}
            >
              {bibleBooks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              className="input-dreamy w-20"
              value={chapter}
              onChange={(e) => {
                setChapter(parseInt(e.target.value) || 1)
                setVerseNumber(1)
              }}
            />
            <input
              type="number"
              min={1}
              className="input-dreamy w-20"
              value={verseNumber}
              onChange={(e) => setVerseNumber(parseInt(e.target.value) || 1)}
            />
          </>
        )}
        <button onClick={fetchVerse} className="btn-dreamy-primary">
          Load
        </button>
        {reference && (
          <button onClick={saveVerse} className="btn-dreamy">
            Save
          </button>
        )}
      </div>
      <div className="card-floating p-4 flex justify-between items-start min-h-[4rem]">
        <div className="flex-1">
          {loading ? 'Loading...' : (
            <>
              <strong>{reference}</strong> - {text}
            </>
          )}
        </div>
        {savedId && (
          <button
            onClick={toggleFavorite}
            className={`p-1 rounded-full transition-colors ${
              isFavorite
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={prevVerse} className="btn-dreamy flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button onClick={nextVerse} className="btn-dreamy flex items-center gap-1">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {reference && (
        <textarea
          className="input-dreamy w-full h-24 resize-none"
          placeholder="What did you learn today?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      )}
    </div>
  )
}

