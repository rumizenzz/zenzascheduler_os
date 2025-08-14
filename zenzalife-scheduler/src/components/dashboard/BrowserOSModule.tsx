import React, { useEffect, useState } from 'react'
import { Rnd } from 'react-rnd'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, OSWindow } from '@/lib/supabase'
import { Plus, X, Monitor } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function BrowserOSModule() {
  const { user } = useAuth()
  const [windows, setWindows] = useState<OSWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [zCounter, setZCounter] = useState(1)

  useEffect(() => {
    if (user) {
      void initialize()
    }
  }, [user])

  const initialize = async () => {
    try {
      await supabase.functions.invoke('ensure-os-schema')
    } catch (err) {
      console.error('Failed to ensure os schema', err)
    }
    await loadWindows()
  }

  const loadWindows = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('os_windows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (error) {
      toast.error('Failed to load windows: ' + error.message)
    } else {
      setWindows(data || [])
      setZCounter((data?.length || 0) + 1)
    }
    setLoading(false)
  }

  const createWindow = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('os_windows')
      .insert({
        user_id: user.id,
        title: 'New Window',
        content: '',
        x: 50,
        y: 50,
        width: 300,
        height: 200,
        z_index: zCounter,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      toast.error('Failed to create window: ' + error.message)
    } else if (data) {
      setWindows((w) => [...w, data])
      setZCounter((z) => z + 1)
    }
  }

  const updateWindow = async (id: string, changes: Partial<OSWindow>) => {
    if (!user) return
    const { error } = await supabase
      .from('os_windows')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      console.error('Failed to update window', error)
    }
  }

  const deleteWindow = async (id: string) => {
    if (!user) return
    const { error } = await supabase
      .from('os_windows')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      toast.error('Failed to delete window: ' + error.message)
    } else {
      setWindows((w) => w.filter((win) => win.id !== id))
    }
  }

  const bringToFront = (id: string) => {
    setZCounter((z) => z + 1)
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, z_index: zCounter + 1 } : w))
    )
    void updateWindow(id, { z_index: zCounter + 1 })
  }

  const handleDragStop = (id: string, x: number, y: number) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)))
    void updateWindow(id, { x, y })
  }

  const handleResizeStop = (
    id: string,
    ref: HTMLElement,
    position: { x: number; y: number }
  ) => {
    const width = parseInt(ref.style.width, 10)
    const height = parseInt(ref.style.height, 10)
    setWindows((ws) =>
      ws.map((w) =>
        w.id === id ? { ...w, width, height, x: position.x, y: position.y } : w
      )
    )
    void updateWindow(id, { width, height, x: position.x, y: position.y })
  }

  const handleContentChange = (id: string, content: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, content } : w)))
  }

  const saveContent = (id: string, content: string) => {
    void updateWindow(id, { content })
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <Monitor className="w-8 h-8" />
          Browser OS
        </h1>
        <button
          onClick={createWindow}
          className="btn-dreamy-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Window
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      )}

      <div className="relative w-full h-[600px] border border-purple-300/30 rounded-md bg-purple-900/20">
        {windows.map((w) => (
          <Rnd
            key={w.id}
            size={{ width: w.width, height: w.height }}
            position={{ x: w.x, y: w.y }}
            bounds="parent"
            style={{ zIndex: w.z_index }}
            onDragStop={(e, d) => handleDragStop(w.id, d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, pos) =>
              handleResizeStop(w.id, ref, pos)
            }
            onMouseDown={() => bringToFront(w.id)}
          >
            <div className="bg-purple-800 text-white rounded shadow-lg flex flex-col h-full">
              <div className="flex items-center justify-between bg-purple-700 px-2 py-1 rounded-t">
                <input
                  className="bg-transparent flex-1 text-sm focus:outline-none"
                  value={w.title}
                  onChange={(e) =>
                    setWindows((ws) =>
                      ws.map((win) =>
                        win.id === w.id ? { ...win, title: e.target.value } : win
                      )
                    )
                  }
                  onBlur={(e) => updateWindow(w.id, { title: e.target.value })}
                />
                <button
                  onClick={() => deleteWindow(w.id)}
                  className="ml-2 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                className="flex-1 p-2 text-sm bg-purple-900/30 resize-none focus:outline-none"
                value={w.content || ''}
                onChange={(e) => handleContentChange(w.id, e.target.value)}
                onBlur={(e) => saveContent(w.id, e.target.value)}
              />
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  )
}
