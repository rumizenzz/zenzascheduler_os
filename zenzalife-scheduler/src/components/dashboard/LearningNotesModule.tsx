import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, LearningNote } from '@/lib/supabase'
import dayjs from 'dayjs'
import { Plus, NotebookText, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { SelectionMeanOverlay } from './SelectionMeanOverlay'

export function LearningNotesModule() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<LearningNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (user) {
      void initialize()
    }
  }, [user])

  const initialize = async () => {
    try {
      await supabase.functions.invoke('ensure-learning-notes-schema')
    } catch (err) {
      console.error('Failed to ensure learning notes schema', err)
    }
    await loadNotes()
  }

  const loadNotes = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('learning_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    if (error) {
      toast.error('Failed to load notes: ' + error.message)
    } else {
      setNotes(data || [])
    }
    setLoading(false)
  }

  const saveNote = async () => {
    if (!user || !title.trim() || !content.trim()) return
    const { error } = await supabase.from('learning_notes').insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save note: ' + error.message)
    } else {
      setTitle('')
      setContent('')
      setShowAdd(false)
      await loadNotes()
      toast.success('Note saved')
    }
  }

  const startEdit = (note: LearningNote) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const updateNote = async () => {
    if (!editingId || !user || !editTitle.trim() || !editContent.trim()) return
    const { error } = await supabase
      .from('learning_notes')
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingId)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to update note: ' + error.message)
    } else {
      setEditingId(null)
      setEditTitle('')
      setEditContent('')
      await loadNotes()
      toast.success('Note updated')
    }
  }

  const deleteNote = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('learning_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete note: ' + error.message)
    } else {
      await loadNotes()
      toast.success('Note deleted')
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium text-purple-800 flex items-center gap-3">
          <NotebookText className="w-8 h-8" />
          Learning Notes
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {showAdd && (
        <div className="card-floating bg-purple-900/90 hover:bg-purple-900/80 text-white p-4 space-y-4">
          <input
            type="text"
            className="input-dreamy w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            className="textarea-dreamy w-full"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
          />
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-dreamy-primary" onClick={saveNote}>
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="card-floating bg-purple-900/80 hover:bg-purple-900/70 text-white p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">{note.title}</h2>
                <div className="flex gap-2">
                  <button className="btn-secondary px-2 py-1" onClick={() => startEdit(note)}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button className="btn-secondary px-2 py-1" onClick={() => deleteNote(note.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap">{note.content}</p>
              <p className="text-sm text-purple-300">
                {dayjs(note.updated_at || note.created_at).format('MMM D, YYYY h:mm A')}
              </p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-purple-300">No notes yet.</p>}
        </div>
      )}

      {editingId && (
        <div className="card-floating bg-purple-900/90 hover:bg-purple-900/80 text-white p-4 space-y-4">
          <input
            type="text"
            className="input-dreamy w-full"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
          />
          <textarea
            className="textarea-dreamy w-full"
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Write your note..."
          />
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setEditingId(null)}>
              Cancel
            </button>
            <button className="btn-dreamy-primary" onClick={updateNote}>
              Update
            </button>
          </div>
        </div>
      )}
      <SelectionMeanOverlay />
    </div>
  )
}

export default LearningNotesModule
