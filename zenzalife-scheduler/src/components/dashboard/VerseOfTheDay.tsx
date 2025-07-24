import React, { useState, useEffect } from 'react'
import { BookOpen, Star } from 'lucide-react'
import dayjs from 'dayjs'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function VerseOfTheDay() {
  const [source, setSource] = useState<'bom' | 'bible'>('bom')
  const [reference, setReference] = useState('')
  const [translation, setTranslation] = useState('kjv')
  const [verse, setVerse] = useState('')
  const [verseRef, setVerseRef] = useState('')
  const [verseText, setVerseText] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchVerse()
  }, [source])

  const fetchVerse = async () => {
    setLoading(true)
    setSavedId(null)
    setIsFavorite(false)
    setNotes('')
    try {
      if (source === 'bom') {
        const res = await fetch('https://book-of-mormon-api.vercel.app/random')
        const data = await res.json()
        setVerse(`${data.reference} - ${data.text}`)
        setVerseRef(data.reference)
        setVerseText(data.text)
      } else {
        const ref = reference || 'John 3:16'
        const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=${translation}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.text) {
          setVerse(`${data.reference} (${translation.toUpperCase()}) - ${data.text.trim()}`)
          setVerseRef(data.reference)
          setVerseText(data.text)
        } else {
          setVerse('No verse found')
          setVerseRef('')
          setVerseText('')
        }
      }
    } catch {
      setVerse('Failed to fetch verse')
    } finally {
      setLoading(false)
    }
  }

  const saveVerse = async () => {
    if (!user || !verseRef) return
    const today = dayjs().format('YYYY-MM-DD')
    const payload = {
      user_id: user.id,
      date: today,
      scripture: verseRef,
      book: source === 'bom' ? 'Book of Mormon' : 'Bible',
      version: source === 'bible' ? translation.toUpperCase() : null,
      full_text: verseText,
      notes: notes.trim() || null,
      is_favorite: isFavorite,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    try {
      const { data: existing } = await supabase
        .from('scripture_notes')
        .select('id, is_favorite, notes')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()
      if (existing) {
        const { error } = await supabase
          .from('scripture_notes')
          .update({ ...payload, created_at: undefined })
          .eq('id', existing.id)
        if (error) throw error
        setSavedId(existing.id)
        setIsFavorite(existing.is_favorite || false)
        setNotes(existing.notes || '')
        toast.success('Verse updated')
      } else {
        const { data, error } = await supabase
          .from('scripture_notes')
          .insert(payload)
          .select('id')
          .maybeSingle()
        if (error) throw error
        if (data) setSavedId(data.id)
        setNotes(notes)
        toast.success('Verse saved to Spiritual Study')
      }
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
        <BookOpen className="w-5 h-5" /> Verse of the Day
      </h2>
      <div className="flex flex-wrap gap-3 items-end">
        <select
          value={source}
          onChange={e => setSource(e.target.value as 'bom' | 'bible')}
          className="input-dreamy"
        >
          <option value="bom">Book of Mormon</option>
          <option value="bible">Bible</option>
        </select>
        {source === 'bible' && (
          <>
            <input
              className="input-dreamy flex-1"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="John 3:16"
            />
            <select
              value={translation}
              onChange={e => setTranslation(e.target.value)}
              className="input-dreamy"
            >
              <option value="kjv">KJV</option>
              <option value="web">WEB</option>
              <option value="oeb-us">OEB-US</option>
            </select>
          </>
        )}
        <button onClick={fetchVerse} className="btn-dreamy-primary">Fetch</button>
        {verse && (
          <button onClick={saveVerse} className="btn-dreamy">Save</button>
        )}
      </div>
      <div className="card-floating p-4 min-h-[4rem] flex justify-between items-start">
        <span>{loading ? 'Loading...' : verse}</span>
        {savedId && (
          <button
            onClick={toggleFavorite}
            className={`p-1 rounded-full transition-colors ${
              isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      {verseRef && (
        <textarea
          className="input-dreamy w-full h-24 resize-none"
          placeholder="What did you learn today?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      )}
    </div>
  )
}
