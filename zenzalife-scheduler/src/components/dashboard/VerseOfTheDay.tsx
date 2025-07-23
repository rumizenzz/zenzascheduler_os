import React, { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'

export function VerseOfTheDay() {
  const [source, setSource] = useState<'bom' | 'bible'>('bom')
  const [reference, setReference] = useState('')
  const [translation, setTranslation] = useState('kjv')
  const [verse, setVerse] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchVerse()
  }, [source])

  const fetchVerse = async () => {
    setLoading(true)
    try {
      if (source === 'bom') {
        const res = await fetch('https://book-of-mormon-api.vercel.app/random')
        const data = await res.json()
        setVerse(`${data.reference} - ${data.text}`)
      } else {
        const ref = reference || 'John 3:16'
        const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=${translation}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.text) {
          setVerse(`${data.reference} - ${data.text.trim()}`)
        } else {
          setVerse('No verse found')
        }
      }
    } catch {
      setVerse('Failed to fetch verse')
    } finally {
      setLoading(false)
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
      </div>
      <div className="card-floating p-4 min-h-[4rem]">
        {loading ? 'Loading...' : verse}
      </div>
    </div>
  )
}
