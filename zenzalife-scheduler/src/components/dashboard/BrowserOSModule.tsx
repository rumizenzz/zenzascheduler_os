import React, { useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, OSWindow, OSDesktopItem, OSPreference } from '@/lib/supabase'
import {
  X,
  Monitor,
  Minus,
  Maximize2,
  Minimize2,
  FileText,
  Folder,
  FolderPlus,
  Terminal as TerminalIcon,
  Settings as SettingsIcon,
  Globe,
} from 'lucide-react'
import { FileExplorer } from './os/FileExplorer'
import { TerminalApp } from './os/TerminalApp'
import { SettingsApp } from './os/SettingsApp'
import { BrowserApp } from './os/BrowserApp'
import { toast } from 'react-hot-toast'

export function BrowserOSModule() {
  const { user } = useAuth()
  const [windows, setWindows] = useState<OSWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [zCounter, setZCounter] = useState(1)
  const desktopRef = useRef<HTMLDivElement>(null)
  const [folders, setFolders] = useState<OSDesktopItem[]>([])
  const [folderMap, setFolderMap] = useState<Record<string, string>>({})
  const [prefs, setPrefs] = useState<OSPreference | null>(null)
  const DEFAULT_WALLPAPER =
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1920&q=80'

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
    await Promise.all([loadWindows(), loadFolders(), loadPreferences()])
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

  const loadFolders = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('os_desktop_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    if (error) {
      toast.error('Failed to load folders: ' + error.message)
    } else {
      setFolders(data || [])
    }
  }

  const loadPreferences = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('os_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (error) {
      const { data: inserted } = await supabase
        .from('os_preferences')
        .insert({ user_id: user.id })
        .select()
        .single()
      if (inserted) setPrefs(inserted as OSPreference)
    } else {
      setPrefs(data as OSPreference)
    }
  }

  type AppType = 'note' | 'files' | 'terminal' | 'settings' | 'browser'

  const createWindow = async (
    app: AppType,
    overrides?: { title?: string; content?: string }
  ) => {
    if (!user) return undefined
    const defaults: Record<AppType, { title: string; content: string }> = {
      note: { title: 'New Note', content: '' },
      files: {
        title: 'File Explorer',
        content: JSON.stringify({ files: [], folders: [] }),
      },
      terminal: { title: 'Terminal', content: '' },
      settings: {
        title: 'Settings',
        content: JSON.stringify({ darkMode: true, wallpaper: DEFAULT_WALLPAPER }),
      },
      browser: {
        title: 'Browser',
        content: JSON.stringify({ url: 'https://example.com' }),
      },
    }
    const d = { ...defaults[app], ...overrides }
    const { data, error } = await supabase
      .from('os_windows')
      .insert({
        user_id: user.id,
        title: d.title,
        content: d.content,
        app,
        x: 50,
        y: 50,
        width: 300,
        height: 200,
        z_index: zCounter,
        minimized: false,
        maximized: false,
        restore_x: null,
        restore_y: null,
        restore_width: null,
        restore_height: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      toast.error('Failed to create window: ' + error.message)
      return undefined
    } else if (data) {
      setWindows((w) => [...w, data])
      setZCounter((z) => z + 1)
      return data
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
      setFolderMap((m) => {
        const { [id]: removed, ...rest } = m
        return rest
      })
    }
  }

  const createDesktopFolder = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('os_desktop_items')
      .insert({
        user_id: user.id,
        name: 'New Folder',
        x: 20,
        y: 20,
        content: JSON.stringify({ files: [], folders: [] }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      toast.error('Failed to create folder: ' + error.message)
    } else if (data) {
      setFolders((f) => [...f, data])
    }
  }

  const updateFolder = async (
    id: string,
    changes: Partial<OSDesktopItem>
  ) => {
    if (!user) return
    const { error } = await supabase
      .from('os_desktop_items')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      console.error('Failed to update folder', error)
    }
  }

  const openFolder = async (folder: OSDesktopItem) => {
    const win = await createWindow('files', {
      title: folder.name,
      content: folder.content,
    })
    if (win) {
      setFolderMap((m) => ({ ...m, [win.id]: folder.id }))
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

  const toggleMinimize = (id: string, minimized: boolean) => {
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, minimized } : w))
    )
    void updateWindow(id, { minimized })
  }

  const toggleMaximize = (id: string) => {
    bringToFront(id)
    const desktop = desktopRef.current
    if (!desktop) return
    setWindows((ws) => {
      const target = ws.find((w) => w.id === id)
      if (!target) return ws
      if (!target.maximized) {
        const updated = ws.map((w) =>
          w.id === id
            ? {
                ...w,
                maximized: true,
                restore_x: w.x,
                restore_y: w.y,
                restore_width: w.width,
                restore_height: w.height,
                x: 0,
                y: 0,
                width: desktop.offsetWidth,
                height: desktop.offsetHeight,
              }
            : w
        )
        void updateWindow(id, {
          maximized: true,
          restore_x: target.x,
          restore_y: target.y,
          restore_width: target.width,
          restore_height: target.height,
          x: 0,
          y: 0,
          width: desktop.offsetWidth,
          height: desktop.offsetHeight,
        })
        return updated
      } else {
        const updated = ws.map((w) =>
          w.id === id
            ? {
                ...w,
                maximized: false,
                x: w.restore_x ?? 50,
                y: w.restore_y ?? 50,
                width: w.restore_width ?? 300,
                height: w.restore_height ?? 200,
              }
            : w
        )
        const restored = updated.find((w) => w.id === id)!
        void updateWindow(id, {
          maximized: false,
          x: restored.x,
          y: restored.y,
          width: restored.width,
          height: restored.height,
        })
        return updated
      }
    })
  }

  const handleContentChange = (id: string, content: string) => {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, content } : w)))
  }

  const saveContent = (id: string, content: string) => {
    void updateWindow(id, { content })
  }

  const handleAppContentChange = (id: string, content: string) => {
    handleContentChange(id, content)
    saveContent(id, content)
    const folderId = folderMap[id]
    if (folderId) {
      setFolders((fs) =>
        fs.map((f) => (f.id === folderId ? { ...f, content } : f))
      )
      void updateFolder(folderId, { content })
    }
    const win = windows.find((w) => w.id === id)
    if (win?.app === 'settings') {
      try {
        const parsed = JSON.parse(content) as {
          darkMode: boolean
          wallpaper: string
        }
        setPrefs((p) =>
          p
            ? { ...p, dark_mode: parsed.darkMode, wallpaper: parsed.wallpaper }
            : p
        )
      } catch {
        // ignore parse errors
      }
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-purple-200 flex items-center gap-3">
          <Monitor className="w-8 h-8" />
          Browser OS
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => createWindow('note')}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            New Note
          </button>
          <button
            onClick={() => createWindow('browser')}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Browser
          </button>
          <button
            onClick={() => createWindow('files')}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <Folder className="w-4 h-4" />
            File Explorer
          </button>
          <button
            onClick={() => createWindow('terminal')}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <TerminalIcon className="w-4 h-4" />
            Terminal
          </button>
          <button
            onClick={() => createWindow('settings')}
            className="btn-dreamy-primary flex items-center gap-2"
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={createDesktopFolder}
            className="btn-dreamy-secondary flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      )}

      <div className="w-full h-[600px] border border-purple-300/30 rounded-md overflow-hidden flex flex-col">
        <div
          ref={desktopRef}
          className="relative flex-1 bg-cover bg-center"
          style={{ backgroundImage: `url(${prefs?.wallpaper ?? DEFAULT_WALLPAPER})` }}
        >
          {folders.map((f) => (
            <Rnd
              key={f.id}
              size={{ width: 80, height: 80 }}
              position={{ x: f.x, y: f.y }}
              bounds="parent"
              enableResizing={false}
              onDragStop={(e, d) => {
                setFolders((fs) =>
                  fs.map((fl) =>
                    fl.id === f.id ? { ...fl, x: d.x, y: d.y } : fl
                  )
                )
                void updateFolder(f.id, { x: d.x, y: d.y })
              }}
            >
              <div
                className="flex flex-col items-center text-purple-200 cursor-pointer"
                onDoubleClick={() => openFolder(f)}
              >
                <Folder className="w-10 h-10" />
                <span className="text-xs mt-1 text-center w-full break-words">
                  {f.name}
                </span>
              </div>
            </Rnd>
          ))}
          {windows
            .filter((w) => !w.minimized)
            .map((w) => (
              <Rnd
                key={w.id}
                size={{ width: w.width, height: w.height }}
                position={{ x: w.x, y: w.y }}
                bounds="parent"
                style={{ zIndex: w.z_index }}
                disableDragging={w.maximized}
                enableResizing={!w.maximized}
                onDragStop={(e, d) => handleDragStop(w.id, d.x, d.y)}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  handleResizeStop(w.id, ref, pos)
                }
                onMouseDown={() => bringToFront(w.id)}
              >
                <div className="bg-purple-800 text-white rounded shadow-lg flex flex-col h-full">
                  <div className="flex items-center bg-purple-700 px-2 py-1 rounded-t">
                    <input
                      className="bg-transparent flex-1 text-sm focus:outline-none"
                      value={w.title}
                      onChange={(e) =>
                        setWindows((ws) =>
                          ws.map((win) =>
                            win.id === w.id
                              ? { ...win, title: e.target.value }
                              : win
                          )
                        )
                      }
                      onBlur={(e) => updateWindow(w.id, { title: e.target.value })}
                    />
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => toggleMinimize(w.id, true)}
                        className="hover:text-purple-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleMaximize(w.id)}
                        className="hover:text-purple-300"
                      >
                        {w.maximized ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteWindow(w.id)}
                        className="hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {w.app === 'files' ? (
                    <FileExplorer
                      content={w.content || ''}
                      onChange={(c) => handleAppContentChange(w.id, c)}
                    />
                  ) : w.app === 'terminal' ? (
                    <TerminalApp
                      content={w.content || ''}
                      onChange={(c) => handleAppContentChange(w.id, c)}
                    />
                  ) : w.app === 'settings' ? (
                    <SettingsApp
                      content={w.content || ''}
                      onChange={(c) => handleAppContentChange(w.id, c)}
                    />
                  ) : w.app === 'browser' ? (
                    <BrowserApp
                      content={w.content || ''}
                      onChange={(c) => handleAppContentChange(w.id, c)}
                    />
                  ) : (
                    <textarea
                      className="flex-1 p-2 text-sm bg-purple-900/30 resize-none focus:outline-none"
                      value={w.content || ''}
                      onChange={(e) => handleContentChange(w.id, e.target.value)}
                      onBlur={(e) => saveContent(w.id, e.target.value)}
                    />
                  )}
                </div>
              </Rnd>
            ))}
        </div>
        <div className="h-8 bg-purple-800 flex items-center gap-2 px-2">
          {windows.map((w) => (
            <button
              key={w.id}
              onClick={() => {
                if (w.minimized) {
                  toggleMinimize(w.id, false)
                  bringToFront(w.id)
                } else {
                  bringToFront(w.id)
                }
              }}
              className={`px-2 text-xs rounded ${w.minimized ? 'bg-purple-600' : 'bg-purple-700'}`}
            >
              {w.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
