import React, { useEffect, useState } from 'react'
import { ScrollText, Pencil, Save, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export function TenYearSelfLetterModule() {
  const { user } = useAuth()

  const defaultLetter = `Dear Future Me,

It's been ten years since I wrote this. I hope you stayed curious, kind, and faithful. Remember the dreams we carried in 2025 and how far we've come. Continue to put family and God first, serve others, and pursue learning with humility. Let setbacks refine you and keep gratitude at the center of everything.

With hope and determination,
Your Past Self`

  const [letter, setLetter] = useState(defaultLetter)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (user) {
      void initialize()
    }
  }, [user])

  const initialize = async () => {
    try {
      await supabase.functions.invoke('ensure-self-letter-schema')
    } catch (err) {
      console.error('Failed to ensure self letter schema', err)
    }
    await loadLetter()
  }

  const loadLetter = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('self_letters')
      .select('content')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) {
      console.error('Failed to load letter', error)
    } else if (data) {
      setLetter(data.content)
    }
  }

  const saveLetter = async () => {
    if (!user) return
    const { error } = await supabase
      .from('self_letters')
      .upsert(
        {
          user_id: user.id,
          content: draft,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    if (error) {
      console.error('Failed to save letter', error)
      toast.error('Failed to save letter: ' + (error.message ?? 'Unknown error'))
    } else {
      setLetter(draft)
      setEditing(false)
      toast.success('Letter saved')
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8 rounded-2xl shadow-lg border border-amber-200 text-gray-800 space-y-6">
      <div className="text-center space-y-2">
        <ScrollText className="w-10 h-10 mx-auto text-amber-500" />
        <h1 className="text-4xl font-bold text-amber-700">10-Year Self Letter</h1>
      </div>
      {editing ? (
        <div className="space-y-4">
          <textarea
            className="w-full h-64 p-4 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex justify-center gap-4">
            <button
              onClick={saveLetter}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-line leading-relaxed">{letter}</p>
          {user && (
            <button
              onClick={() => {
                setDraft(letter)
                setEditing(true)
              }}
              className="mx-auto mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default TenYearSelfLetterModule
