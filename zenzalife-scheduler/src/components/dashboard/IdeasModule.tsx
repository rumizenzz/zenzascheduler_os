import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Idea } from '@/lib/supabase'
import dayjs from 'dayjs'
import { Plus, Lightbulb, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function IdeasModule() {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (user) {
      void loadIdeas()
    }
  }, [user])

  const loadIdeas = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load ideas: ' + error.message)
    } else {
      setIdeas(data || [])
    }
    setLoading(false)
  }

  const saveIdea = async () => {
    if (!user || !content.trim()) return
    const { error } = await supabase.from('ideas').insert({
      user_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    if (error) {
      toast.error('Failed to save idea: ' + error.message)
    } else {
      setContent('')
      setShowAdd(false)
      await loadIdeas()
      toast.success('Idea saved')
    }
  }

  const deleteIdea = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete idea: ' + error.message)
    } else {
      await loadIdeas()
      toast.success('Idea deleted')
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <Lightbulb className="w-8 h-8" />
          Ideas
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Idea
        </button>
      </div>

      {showAdd && (
        <div className="card-floating bg-purple-900/80 text-white p-4 space-y-4">
          <textarea
            className="textarea-dreamy w-full"
            rows={5}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's your idea?"
          />
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn-dreamy-primary" onClick={saveIdea}>
              Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      ) : ideas.length > 0 ? (
        <div className="space-y-4">
          {ideas.map(i => (
            <div key={i.id} className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-600 p-4 rounded-lg text-white">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs opacity-80">
                  {dayjs(i.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </span>
                <button
                  className="flex items-center gap-1 text-sm hover:text-purple-200"
                  onClick={() => deleteIdea(i.id)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
              <div className="whitespace-pre-wrap">{i.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">No ideas yet</div>
      )}
    </div>
  )
}
