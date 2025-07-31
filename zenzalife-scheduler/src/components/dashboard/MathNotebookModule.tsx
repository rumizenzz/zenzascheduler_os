import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Excalidraw as ExcalidrawLib } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { PlusCircle, History } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type {
  AppState,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

const Excalidraw = React.forwardRef<
  ExcalidrawImperativeAPI,
  ExcalidrawProps
>((props, ref) => {
  const Comp = ExcalidrawLib as any
  return <Comp {...props} ref={ref} />
})
Excalidraw.displayName = 'Excalidraw'

type ExcalidrawData = {
  elements: readonly ExcalidrawElement[]
  appState: Partial<AppState>
}

interface TabData {
  id: string
  name: string
  data: ExcalidrawData
  history: { id: string; created_at: string; data: ExcalidrawData }[]
}

export function MathNotebookModule() {
  const { user } = useAuth()
  const [tabs, setTabs] = useState<TabData[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const [contextMenu, setContextMenu] = useState<
    { x: number; y: number; elementId: string } | null
  >(null)
  const [editing, setEditing] = useState<
    { id: string; text: string; original: string } | null
  >(null)
  const [textHistories, setTextHistories] = useState<
    Record<string, { text: string; editedAt: string }[]>
  >({})
  const [historyView, setHistoryView] = useState<{ id: string } | null>(null)

  const getHistoryKey = useCallback(
    (problemId: string, elementId: string) => `${problemId}-${elementId}`,
    [],
  )

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const { data, error } = await supabase
        .from('math_problems')
        .select(
          'id, name, data, math_problem_versions(id, data, created_at), math_text_history(element_id, text, created_at)',
        )
        .eq('user_id', user.id)
        .order('created_at')

      if (error) {
        console.error('Failed to load math problems:', error)
        toast.error('Failed to load math problems')
        return
      }

        if (data && data.length > 0) {
          const histories: Record<string, { text: string; editedAt: string }[]> = {}
          const formatted = data.map((p: any) => {
            const { collaborators, ...appState } = p.data?.appState || {}
            if (p.math_text_history) {
              p.math_text_history.forEach((h: any) => {
                const key = getHistoryKey(p.id, h.element_id)
                histories[key] = [
                  ...(histories[key] || []),
                  { text: h.text, editedAt: h.created_at },
                ]
              })
            }
            return {
              id: p.id,
              name: p.name,
              data: { elements: p.data?.elements || [], appState },
              history:
                p.math_problem_versions?.map((v: any) => {
                  const { collaborators: _c, ...vAppState } = v.data?.appState || {}
                  return {
                    id: v.id,
                    created_at: v.created_at,
                    data: { elements: v.data?.elements || [], appState: vAppState },
                  }
                }) || [],
            }
          })
          setTabs(formatted)
          setActiveTabId(formatted[0].id)
          setTextHistories(histories)
        } else {
        const { data: inserted, error: insertError } = await supabase
          .from('math_problems')
          .insert({
            user_id: user.id,
            name: 'Problem 1',
            data: { elements: [], appState: {} }
          })
          .select('id, name, data')
          .single()

        if (insertError) {
          console.error('Failed to create math problem:', insertError)
          toast.error('Failed to create math problem')
          return
        }

        const { collaborators: _c, ...appState } = inserted.data?.appState || {}
        const newTab: TabData = {
          id: inserted.id,
          name: inserted.name,
          data: { elements: inserted.data?.elements || [], appState },
          history: []
        }
        setTabs([newTab])
        setActiveTabId(newTab.id)
      }
    }

    load()
  }, [user, getHistoryKey])

  const addTab = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('math_problems')
      .insert({
        user_id: user.id,
        name: `Problem ${tabs.length + 1}`,
        data: { elements: [], appState: {} }
      })
      .select('id, name, data')
      .single()

    if (error) {
      console.error('Failed to add tab:', error)
      toast.error('Failed to add tab')
      return
    }

    const { collaborators: _c, ...appState } = data.data?.appState || {}
    const newTab: TabData = {
      id: data.id,
      name: data.name,
      data: { elements: data.data?.elements || [], appState },
      history: []
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

    const updateTabData = useCallback(
      async (elements: readonly ExcalidrawElement[], appState: AppState) => {
        const { collaborators, ...cleanAppState } = appState
        const newData = { elements, appState: cleanAppState }
        setTabs((prev) =>
          prev.map((tab) => (tab.id === activeTabId ? { ...tab, data: newData } : tab))
        )
        if (activeTabId) {
          await supabase
            .from('math_problems')
            .update({ data: newData, updated_at: new Date().toISOString() })
            .eq('id', activeTabId)
        }
      },
      [activeTabId]
    )

  const saveVersion = async () => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return
    const { collaborators, ...cleanAppState } = tab.data.appState || {}
    const versionData = { elements: tab.data.elements, appState: cleanAppState }

    const { data, error } = await supabase
      .from('math_problem_versions')
      .insert({ problem_id: tab.id, data: versionData })
      .select('id, data, created_at')
      .single()

    if (error) {
      console.error('Failed to save version:', error)
      toast.error('Failed to save version')
      return
    }

    const newVersion = { id: data.id, created_at: data.created_at, data: versionData }
    const newTabs = tabs.map((t) =>
      t.id === tab.id ? { ...t, history: [...t.history, newVersion] } : t
    )
    setTabs(newTabs)
  }

  const restoreVersion = async (versionId: string) => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return
    const version = tab.history.find((h) => h.id === versionId)
    if (!version) return
    const { collaborators, ...cleanAppState } = version.data.appState || {}
    const versionData = { elements: version.data.elements, appState: cleanAppState }

    const newTabs = tabs.map((t) =>
      t.id === tab.id ? { ...t, data: versionData } : t
    )
    setTabs(newTabs)
    await supabase
      .from('math_problems')
      .update({ data: versionData, updated_at: new Date().toISOString() })
      .eq('id', tab.id)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const api = excalidrawRef.current
    if (!api) return
    const ids = api.getAppState().selectedElementIds
    const elements = api.getSceneElements()
    const selected = elements.find((el) => ids[el.id])
    if (selected && selected.type === 'text') {
      setContextMenu({ x: e.clientX, y: e.clientY, elementId: selected.id })
    } else {
      setContextMenu(null)
    }
  }

  const startEdit = () => {
    if (!contextMenu || !excalidrawRef.current) return
    const el = excalidrawRef.current
      .getSceneElements()
      .find((e) => e.id === contextMenu.elementId)
    if (!el || el.type !== 'text') return
    setEditing({ id: el.id, text: el.text, original: el.text })
    setContextMenu(null)
  }

    const saveEdit = async () => {
      if (!editing || !excalidrawRef.current) return
      const api = excalidrawRef.current
      const elements = api.getSceneElements().map((el) =>
        el.id === editing.id && el.type === 'text'
          ? { ...el, text: editing.text }
          : el,
      )
      api.updateScene({ elements })
      const key = getHistoryKey(activeTabId, editing.id)
      const entry = {
        text: editing.original,
        editedAt: new Date().toISOString(),
      }
      setTextHistories((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), entry],
      }))
      const { error } = await supabase.from('math_text_history').insert({
        problem_id: activeTabId,
        element_id: editing.id,
        text: editing.original,
      })
      if (error) {
        console.error('Failed to save text history:', error)
      }
      setEditing(null)
    }

    const openHistory = () => {
      if (!contextMenu) return
      setHistoryView({ id: getHistoryKey(activeTabId, contextMenu.elementId) })
      setContextMenu(null)
    }

  const activeTab = tabs.find((t) => t.id === activeTabId)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap flex-1 pr-32 sm:pr-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                tab.id === activeTabId
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white/70 text-gray-700 border-gray-300 hover:bg-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
          <button
            onClick={addTab}
            className="p-1 rounded-full border border-gray-300 hover:bg-white flex-shrink-0"
            title="New Tab"
          >
            <PlusCircle className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        {activeTab && activeTab.history.length > 0 && (
          <select
            className="input-dreamy max-w-xs ml-2 flex-shrink-0"
            onChange={(e) => restoreVersion(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              History
            </option>
            {activeTab.history
              .slice()
              .reverse()
              .map((h) => (
                <option key={h.id} value={h.id}>
                  {new Date(h.created_at).toLocaleString()}
                </option>
              ))}
          </select>
        )}
        <button
          onClick={saveVersion}
          className="p-1 rounded-full border border-gray-300 hover:bg-white flex-shrink-0"
          title="Save Version"
        >
          <History className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      <div
        className="relative h-[600px] rounded-lg border bg-white"
        onContextMenu={handleContextMenu}
        onClick={() => setContextMenu(null)}
      >
        {activeTab && (
          <Excalidraw
            ref={excalidrawRef}
            key={activeTab.id}
            initialData={activeTab.data}
            onChange={updateTabData}
          />
        )}
        {contextMenu && (
          <div
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-50 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-2 text-white shadow-lg animate-pulse"
          >
            <button
              className="block w-full rounded px-2 py-1 text-left hover:bg-white/20"
              onClick={startEdit}
            >
              Edit
            </button>
              {textHistories[getHistoryKey(activeTabId, contextMenu.elementId)]?.length ? (
                <button
                  className="mt-1 block w-full rounded px-2 py-1 text-left hover:bg-white/20"
                  onClick={openHistory}
                >
                  History
                </button>
              ) : null}
          </div>
        )}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-80 space-y-2 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 text-white shadow-xl">
              <textarea
                className="w-full rounded p-2 text-black"
                value={editing.text}
                onChange={(e) =>
                  setEditing({ ...editing, text: e.target.value })
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="rounded bg-white/20 px-3 py-1 hover:bg-white/30"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="rounded bg-white px-3 py-1 text-gray-800 hover:bg-gray-100"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {historyView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[80vh] w-80 overflow-auto rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 text-white shadow-xl">
              <h3 className="mb-2 text-lg font-bold">Edit History</h3>
              <ul className="space-y-1">
                {textHistories[historyView.id]?.map((h, i) => (
                  <li key={i} className="rounded bg-white/20 p-2">
                    <div className="mb-1 text-xs">
                      {new Date(h.editedAt).toLocaleString()}
                    </div>
                    <div className="whitespace-pre-wrap">{h.text}</div>
                  </li>
                )) || <li className="rounded bg-white/20 p-2">No history</li>}
              </ul>
              <button
                onClick={() => setHistoryView(null)}
                className="mt-2 rounded bg-white px-3 py-1 text-gray-800 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
