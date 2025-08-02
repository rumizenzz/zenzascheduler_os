import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, DreamJournalEntry } from '@/lib/supabase'
import dayjs from 'dayjs'
import { Plus, NotebookPen, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function LucidDreamJournalModule() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DreamJournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')

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
      toast.error('Failed to load dream journal entries: ' + error.message)
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
      achieved_lucidity: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save dream journal entry: ' + error.message)
    } else {
      setDescription('')
      setShowAdd(false)
      await loadEntries()
      toast.success('Dream journal entry saved')
    }
  }

  const startEdit = (entry: DreamJournalEntry) => {
    setEditingId(entry.id)
    setEditDescription(entry.description)
  }

  const updateEntry = async () => {
    if (!editingId || !user || !editDescription.trim()) return
    const { error } = await supabase
      .from('dream_journal_entries')
      .update({ description: editDescription.trim(), updated_at: new Date().toISOString() })
      .eq('id', editingId)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to update dream journal entry: ' + error.message)
    } else {
      setEditingId(null)
      setEditDescription('')
      await loadEntries()
      toast.success('Dream journal entry updated')
    }
  }

  const deleteEntry = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('dream_journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete dream journal entry: ' + error.message)
    } else {
      await loadEntries()
      toast.success('Dream journal entry deleted')
    }
  }

  const grouped = entries.reduce<Record<string, DreamJournalEntry[]>>((acc, entry) => {
    const date = dayjs(entry.created_at).format('YYYY-MM-DD')
    acc[date] = acc[date] || []
    acc[date].push(entry)
    return acc
  }, {})

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <NotebookPen className="w-8 h-8" />
          Dream Journal
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {showAdd && (
        <div className="card-floating bg-purple-900/80 text-white p-4 space-y-4">
          <textarea
            className="textarea-dreamy w-full"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your thoughts..."
          />
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
          {Object.entries(grouped).map(([date, items]) => (
            <div
              key={date}
              className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-600 p-6 rounded-lg shadow-lg text-white font-serif"
            >
              <h2 className="text-xl mb-4 border-b border-white/20 pb-2">
                {dayjs(date).format('MMMM D, YYYY')}
              </h2>
              <div className="space-y-4">
                {items.map((entry) => (
                  <div key={entry.id} className="bg-white/10 p-4 rounded-lg whitespace-pre-wrap space-y-2">
                    {editingId === entry.id ? (
                      <>
                        <div className="text-xs opacity-80">
                          {dayjs(entry.created_at).format('YYYY-MM-DD hh:mm:ss A')}
                        </div>
                        <textarea
                          className="textarea-dreamy w-full"
                          rows={5}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                          <button className="btn-secondary" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                          <button className="btn-dreamy-primary" onClick={updateEntry}>
                            Save
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs opacity-80">
                          {dayjs(entry.created_at).format('YYYY-MM-DD hh:mm:ss A')}
                        </div>
                        <div>{entry.description}</div>
                        <div className="flex gap-2 justify-end text-sm">
                          <button
                            className="flex items-center gap-1 hover:text-purple-200"
                            onClick={() => startEdit(entry)}
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <button
                            className="flex items-center gap-1 hover:text-purple-200"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LucidDreamJournalModule
