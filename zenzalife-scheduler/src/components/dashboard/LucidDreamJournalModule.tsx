import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  supabase,
  DreamJournalEntry,
  DreamJournalEntryHistory,
} from '@/lib/supabase'
import dayjs from 'dayjs'
import { Plus, NotebookPen, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function LucidDreamJournalModule() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<DreamJournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [histories, setHistories] = useState<
    Record<string, DreamJournalEntryHistory[]>
  >({})
  const [historyViewId, setHistoryViewId] = useState<string | null>(null)

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
    if (!user || !title.trim() || !description.trim()) return
    const { error } = await supabase.from('dream_journal_entries').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      achieved_lucidity: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save dream journal entry: ' + error.message)
    } else {
      setTitle('')
      setDescription('')
      setShowAdd(false)
      await loadEntries()
      toast.success('Dream journal entry saved')
    }
  }

  const startEdit = (entry: DreamJournalEntry) => {
    setEditingId(entry.id)
    setEditTitle(entry.title)
    setEditDescription(entry.description)
  }

  const updateEntry = async () => {
    if (!editingId || !user || !editTitle.trim() || !editDescription.trim()) return
    const existing = entries.find((e) => e.id === editingId)
    if (existing) {
      await supabase.from('dream_journal_entry_history').insert({
        entry_id: existing.id,
        user_id: user.id,
        title: existing.title,
        description: existing.description,
        edited_at: new Date().toISOString(),
      })
    }
    const { error } = await supabase
      .from('dream_journal_entries')
      .update({
        title: editTitle.trim(),
        description: editDescription.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingId)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to update dream journal entry: ' + error.message)
    } else {
      setEditingId(null)
      setEditTitle('')
      setEditDescription('')
      await loadEntries()
      toast.success('Dream journal entry updated')
    }
  }

  const loadHistory = async (id: string) => {
    if (histories[id]) return
    const { data, error } = await supabase
      .from('dream_journal_entry_history')
      .select('*')
      .eq('entry_id', id)
      .order('edited_at', { ascending: false })
    if (error) {
      toast.error('Failed to load history: ' + error.message)
    } else {
      setHistories((prev) => ({ ...prev, [id]: data || [] }))
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
          <input
            className="input-dreamy w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name of the Dream (so you can remember it better)"
          />
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
                        <input
                          className="input-dreamy w-full"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Name of the Dream"
                        />
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
                        <div className="font-semibold">{entry.title}</div>
                        <div>
                          {entry.description}
                          {entry.updated_at && entry.updated_at !== entry.created_at && (
                            <span
                              className="relative ml-2 text-xs opacity-70 cursor-pointer underline group"
                              onMouseEnter={() => void loadHistory(entry.id)}
                              onClick={() => {
                                void loadHistory(entry.id)
                                setHistoryViewId(entry.id)
                              }}
                            >
                              (edited)
                              {histories[entry.id]?.[0]?.description && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 hidden w-64 whitespace-pre-line rounded bg-purple-900 px-2 py-1 text-xs text-purple-200 shadow-lg group-hover:block">
                                  {histories[entry.id][0].description.slice(0, 100)}
                                </div>
                              )}
                            </span>
                          )}
                        </div>
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

      {historyViewId &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 harold-sky">
            <div className="bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto text-purple-100 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg">Edit History</h2>
                <button className="btn-secondary" onClick={() => setHistoryViewId(null)}>
                  Close
                </button>
              </div>
              {histories[historyViewId]?.map((h) => (
                <div key={h.id} className="space-y-1">
                  <div className="text-xs opacity-70">
                    {dayjs(h.edited_at).format('YYYY-MM-DD hh:mm:ss A')}
                  </div>
                  {h.title && <div className="font-semibold">{h.title}</div>}
                  <div className="whitespace-pre-wrap">{h.description}</div>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default LucidDreamJournalModule
