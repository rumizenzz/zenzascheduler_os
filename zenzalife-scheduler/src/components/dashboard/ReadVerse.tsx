import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Star,
  BookMarked
} from 'lucide-react'
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

const bibleChapterCounts: Record<string, number> = {
  Genesis: 50,
  Exodus: 40,
  Leviticus: 27,
  Numbers: 36,
  Deuteronomy: 34,
  Joshua: 24,
  Judges: 21,
  Ruth: 4,
  '1 Samuel': 31,
  '2 Samuel': 24,
  '1 Kings': 22,
  '2 Kings': 25,
  '1 Chronicles': 29,
  '2 Chronicles': 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  'Song of Solomon': 8,
  Isaiah: 66,
  Jeremiah: 52,
  Lamentations: 5,
  Ezekiel: 48,
  Daniel: 12,
  Hosea: 14,
  Joel: 3,
  Amos: 9,
  Obadiah: 1,
  Jonah: 4,
  Micah: 7,
  Nahum: 3,
  Habakkuk: 3,
  Zephaniah: 3,
  Haggai: 2,
  Zechariah: 14,
  Malachi: 4,
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
  Acts: 28,
  Romans: 16,
  '1 Corinthians': 16,
  '2 Corinthians': 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  '1 Thessalonians': 5,
  '2 Thessalonians': 3,
  '1 Timothy': 6,
  '2 Timothy': 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  '1 Peter': 5,
  '2 Peter': 3,
  '1 John': 5,
  '2 John': 1,
  '3 John': 1,
  Jude: 1,
  Revelation: 22
}

const bookOfMormonChapterCounts: Record<string, number> = {
  '1 Nephi': 22,
  '2 Nephi': 33,
  Jacob: 7,
  Enos: 1,
  Jarom: 1,
  Omni: 1,
  'Words of Mormon': 1,
  Mosiah: 29,
  Alma: 63,
  Helaman: 16,
  '3 Nephi': 30,
  '4 Nephi': 1,
  Mormon: 9,
  Ether: 15,
  Moroni: 10
}

export function ReadVerse() {
  const [source, setSource] = useState<'bom' | 'bible'>('bom')
  const [view, setView] = useState<'read' | 'library'>('read')
  const [bomIndex, setBomIndex] = useState(0)
  const [bibleBook, setBibleBook] = useState('John')
  const [chapter, setChapter] = useState(1)
  const [verseNumber, setVerseNumber] = useState(1)
  const [libStage, setLibStage] = useState<'books' | 'chapters' | 'verses'>('books')
  const [selectedBook, setSelectedBook] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [reference, setReference] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [notes, setNotes] = useState('')
  const [bibleChapterVerses, setBibleChapterVerses] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (view === 'read') {
      fetchVerse()
    }
  }, [view, source, bomIndex, bibleBook, chapter, verseNumber])

  useEffect(() => {
    if (view === 'library' && source === 'bible' && libStage === 'verses') {
      fetchBibleChapter(selectedBook, selectedChapter)
    }
  }, [view, source, selectedBook, selectedChapter, libStage])

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

  const fetchBibleChapter = async (book = bibleBook, chap = chapter) => {
    setLoading(true)
    try {
      const ref = `${book} ${chap}`
      const res = await fetch(
        `https://bible-api.com/${encodeURIComponent(ref)}`
      )
      const data = await res.json()
      if (data.verses) {
        setBibleChapterVerses(data.verses)
      } else {
        setBibleChapterVerses([])
      }
    } catch {
      setBibleChapterVerses([])
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
      setBomIndex(
        (i) => (i - 1 + bookOfMormonScriptures.length) % bookOfMormonScriptures.length
      )
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

  if (view === 'library') {
    const books =
      source === 'bom'
        ? Object.keys(bookOfMormonChapterCounts)
        : bibleBooks
    const chapters =
      source === 'bom'
        ? Array.from(
            { length: bookOfMormonChapterCounts[selectedBook] || 0 },
            (_, i) => i + 1
          )
        : Array.from(
            { length: bibleChapterCounts[selectedBook] || 0 },
            (_, i) => i + 1
          )
    const verses =
      source === 'bom'
        ? bookOfMormonScriptures
            .filter((v) => {
              const m = v.reference.match(/(.+) (\d+):(\d+)/)
              return (
                m && m[1] === selectedBook && parseInt(m[2]) === selectedChapter
              )
            })
            .map((v) => ({ reference: v.reference, text: v.text }))
        : bibleChapterVerses.map((v) => ({
            reference: `${selectedBook} ${selectedChapter}:${v.verse}`,
            text: v.text
          }))

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Verse Library
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setView('read')} className="btn-dreamy">
            Back
          </button>
          <button
            onClick={() => {
              setSource('bom')
              setLibStage('books')
              setSelectedBook('')
              setSelectedChapter(1)
            }}
            className={`btn-dreamy ${source === 'bom' ? 'btn-dreamy-primary' : ''}`}
          >
            Book of Mormon
          </button>
          <button
            onClick={() => {
              setSource('bible')
              setLibStage('books')
              setSelectedBook('')
              setSelectedChapter(1)
            }}
            className={`btn-dreamy ${source === 'bible' ? 'btn-dreamy-primary' : ''}`}
          >
            Bible
          </button>
          {libStage !== 'books' && (
            <button onClick={() => setLibStage('books')} className="btn-dreamy">
              All Books
            </button>
          )}
          {libStage === 'verses' && (
            <button
              onClick={() => setLibStage('chapters')}
              className="btn-dreamy"
            >
              All Chapters
            </button>
          )}
        </div>
        {libStage === 'books' && (
          <div className="card-floating p-2 h-96 overflow-y-auto space-y-2">
            {books.map((b) => (
              <div
                key={b}
                className="p-2 rounded hover:bg-purple-50 cursor-pointer"
                onClick={() => {
                  setSelectedBook(b)
                  if (source === 'bible') setBibleBook(b)
                  setSelectedChapter(1)
                  setChapter(1)
                  setLibStage('chapters')
                }}
              >
                {b}
              </div>
            ))}
          </div>
        )}
        {libStage === 'chapters' && (
          <div className="card-floating p-2 h-96 overflow-y-auto space-y-2">
            {chapters.map((c) => (
              <div
                key={c}
                className="p-2 rounded hover:bg-purple-50 cursor-pointer"
                onClick={() => {
                  setSelectedChapter(c)
                  setChapter(c)
                  setLibStage('verses')
                }}
              >
                Chapter {c}
              </div>
            ))}
          </div>
        )}
        {libStage === 'verses' && (
          <div className="card-floating p-2 h-96 overflow-y-auto space-y-2">
            {loading && source === 'bible'
              ? 'Loading...'
              : verses.map((v) => (
                  <div
                    key={v.reference}
                    className="p-2 rounded hover:bg-purple-50 cursor-pointer"
                    onClick={() => {
                      setView('read')
                      if (source === 'bom') {
                        const idx = bookOfMormonScriptures.findIndex(
                          (s) => s.reference === v.reference
                        )
                        if (idx !== -1) setBomIndex(idx)
                        setReference(v.reference)
                        setText(v.text)
                      } else {
                        const verse = bibleChapterVerses.find(
                          (s) =>
                            `${selectedBook} ${selectedChapter}:${s.verse}` ===
                            v.reference
                        )
                        if (verse) {
                          setBibleBook(selectedBook)
                          setChapter(selectedChapter)
                          setVerseNumber(verse.verse)
                          setReference(v.reference)
                          setText(verse.text.trim())
                        }
                      }
                    }}
                  >
                    <strong>{v.reference}</strong> - {v.text}
                  </div>
                ))}
          </div>
        )}
      </div>
    )
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
        <button
          onClick={() => {
            setView('library')
            setLibStage('books')
            setSelectedBook('')
            setSelectedChapter(1)
          }}
          className="btn-dreamy flex items-center gap-1"
        >
          <BookMarked className="w-4 h-4" /> Library
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

