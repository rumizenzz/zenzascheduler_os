import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { X, Search } from 'lucide-react'
import { supabase, getCurrentUser, TaskComment } from '@/lib/supabase'

interface TaskNotesProps {
  taskId: string
}

export function TaskNotes({ taskId }: TaskNotesProps) {
  const [notes, setNotes] = useState<TaskComment[]>([])
  const [newNote, setNewNote] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadNotes()
  }, [taskId])

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
    if (!error) setNotes(data || [])
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    const user = await getCurrentUser()
    if (!user) return
    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        author_id: user.id,
        content: newNote.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
    if (!error && data) {
      setNotes([data[0] as TaskComment, ...notes])
      setNewNote('')
    }
  }

  const latest = notes[0]

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Add Note</label>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="input-dreamy w-full h-20 resize-none"
          placeholder="Thoughts or updates"
        />
        <button onClick={addNote} className="btn-dreamy-primary mt-1">
          Save Note
        </button>
      </div>
      {latest && (
        <div className="text-xs text-gray-600">
          Latest ({dayjs(latest.created_at).format('MMM D, h:mm A')}):{' '}
          {latest.content.slice(0, 50)}
          {latest.content.length > 50 ? '...' : ''}{' '}
          <button
            className="underline"
            onClick={() => setShowHistory(true)}
          >
            History
          </button>
        </div>
      )}
      {showHistory && (
        <NotesHistoryModal
          notes={notes}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}

interface NotesHistoryModalProps {
  notes: TaskComment[]
  onClose: () => void
}

function NotesHistoryModal({ notes, onClose }: NotesHistoryModalProps) {
  const [search, setSearch] = useState('')
  const filtered = notes.filter(n =>
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto p-4 space-y-4">
        <div className="text-right">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-xl font-light text-gray-800">Notes History</h3>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            aria-label="Search notes"
            className="input-dreamy w-full pl-9 rounded-full border-2 border-gray-300 focus:border-purple-500"
          />
        </div>
        <ul className="space-y-2">
          {filtered.map(n => (
            <li key={n.id} className="p-2 bg-white rounded-lg shadow">
              <div className="text-xs text-gray-500 mb-1">
                {dayjs(n.created_at).format('MMM D, h:mm A')}
              </div>
              <div className="text-sm whitespace-pre-wrap">{n.content}</div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500">No notes found.</p>
        )}
      </div>
    </div>
  )
}
