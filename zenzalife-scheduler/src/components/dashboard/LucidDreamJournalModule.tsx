import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, DreamJournalEntry } from '@/lib/supabase'
import dayjs from 'dayjs'
import { Plus, MoonStar } from 'lucide-react'
import { toast } from 'react-hot-toast'

const lucidityLevels = [
  { value: 1, label: '1 - Non-lucid dream' },
  { value: 2, label: '2 - Brief awareness' },
  { value: 3, label: '3 - Vague recognition' },
  { value: 4, label: '4 - Partially lucid' },
  { value: 5, label: '5 - Some control' },
  { value: 6, label: '6 - Moderately lucid' },
  { value: 7, label: '7 - Strong control' },
  { value: 8, label: '8 - Very lucid' },
  { value: 9, label: '9 - Near total control' },
  { value: 10, label: '10 - Fully lucid and aware' },
]

export function LucidDreamJournalModule() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DreamJournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [description, setDescription] = useState('')
  const [achieved, setAchieved] = useState(false)
  const [level, setLevel] = useState(5)

  useEffect(() => {
    if (user) {
      void loadEntries()
    }
  }, [user])

  const loadEntries = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('dream_journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load dreams: ' + error.message)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }

  const saveEntry = async () => {
    if (!user || !description.trim()) return
    const { error } = await supabase.from('dream_journal_entries').insert({
      user_id: user.id,
      description: description.trim(),
      achieved_lucidity: achieved,
      lucidity_level: achieved ? level : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save dream: ' + error.message)
    } else {
      setDescription('')
      setAchieved(false)
      setLevel(5)
      setShowAdd(false)
      await loadEntries()
      toast.success('Dream saved')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <MoonStar className="w-8 h-8" />
          Dream Journal
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Dream
        </button>
      </div>

      {showAdd && (
        <div className="card-floating bg-indigo-900/80 text-white p-4 space-y-4">
          <textarea
            className="w-full p-2 rounded text-black"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your dream..."
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={achieved}
              onChange={(e) => setAchieved(e.target.checked)}
            />
            Did you achieve lucidity?
          </label>
          {achieved && (
            <select
              className="input-dreamy w-full"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            >
              {lucidityLevels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-dreamy-primary" onClick={saveEntry}>
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-600 p-6 rounded-lg shadow-lg text-white font-serif space-y-2"
            >
              <div className="text-sm opacity-80">
                {dayjs(entry.created_at).format('MMMM D, YYYY')}
              </div>
              <div className="whitespace-pre-wrap">{entry.description}</div>
              <div className="text-sm mt-2">
                Lucidity: {entry.achieved_lucidity ? entry.lucidity_level : 'None'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LucidDreamJournalModule
