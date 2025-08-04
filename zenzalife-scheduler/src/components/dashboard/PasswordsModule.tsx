import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, PasswordEntry } from '@/lib/supabase'
import { Plus, Key, Trash2, Eye, EyeOff, Copy, Wand2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function PasswordsModule() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [username, setUsername] = useState('')
  const [url, setUrl] = useState('')
  const [password, setPassword] = useState('')
  const [notes, setNotes] = useState('')
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) {
      void loadEntries()
    }
  }, [user])

  const loadEntries = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('passwords')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load passwords: ' + error.message)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }

  const saveEntry = async () => {
    if (!user || !title.trim() || !password.trim()) return
    const { error } = await supabase.from('passwords').insert({
      user_id: user.id,
      title: title.trim(),
      username: username.trim() || null,
      url: url.trim() || null,
      password: password.trim(),
      notes: notes.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    if (error) {
      toast.error('Failed to save password: ' + error.message)
    } else {
      setTitle('')
      setUsername('')
      setUrl('')
      setPassword('')
      setNotes('')
      setShowAdd(false)
      await loadEntries()
      toast.success('Password saved')
    }
  }

  const deleteEntry = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('passwords')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete password: ' + error.message)
    } else {
      await loadEntries()
      toast.success('Password deleted')
    }
  }

  const toggleVisible = (id: string) => {
    setVisible(v => ({ ...v, [id]: !v[id] }))
  }

  const generatePassword = () => {
    const length = 16
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setPassword(result)
  }

  const copyPassword = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Password copied')
    } catch {
      toast.error('Failed to copy password')
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <Key className="w-8 h-8" />
          Passwords
        </h1>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Password
        </button>
      </div>

      {showAdd && (
        <div className="card-floating bg-purple-900/80 text-white p-4 space-y-4">
          <input
            className="input-dreamy w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Account or Site"
          />
          <input
            className="input-dreamy w-full"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            className="input-dreamy w-full"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="URL"
          />
          <div className="flex gap-2">
            <input
              className="input-dreamy w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button className="btn-secondary whitespace-nowrap" onClick={generatePassword}>
              <Wand2 className="w-4 h-4" /> Generate
            </button>
          </div>
          <textarea
            className="input-dreamy w-full h-24"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes"
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
      ) : entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map(e => (
            <div key={e.id} className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-600 p-4 rounded-lg text-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{e.title}</span>
                <button
                  className="flex items-center gap-1 text-sm hover:text-purple-200"
                  onClick={() => deleteEntry(e.id)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
              {e.username && <div className="text-sm text-purple-200 mb-1">{e.username}</div>}
              {e.url && (
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline text-purple-200 mb-1 block"
                >
                  {e.url}
                </a>
              )}
              {e.notes && <div className="text-sm mb-2">{e.notes}</div>}
              <div className="flex items-center gap-2">
                <span>{visible[e.id] ? e.password : '••••••'}</span>
                <button onClick={() => toggleVisible(e.id)} className="hover:text-purple-200">
                  {visible[e.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => copyPassword(e.password)} className="hover:text-purple-200">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">No passwords yet</div>
      )}
    </div>
  )
}
