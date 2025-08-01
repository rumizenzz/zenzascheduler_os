import React, { useCallback, useEffect, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { PlusCircle, History, X, Home } from 'lucide-react'
import { MathSolver } from './MathSolver'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import type { AppState } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

type ExcalidrawData = {
  elements: readonly ExcalidrawElement[]
  appState: Partial<AppState>
}

interface TabData {
  id: string
  name: string
  data: ExcalidrawData
  updated_at: string
  lastOpened: string
  history: { id: string; created_at: string; data: ExcalidrawData }[]
}

export function MathNotebookModule() {
  const { user, profile } = useAuth()
  const [problems, setProblems] = useState<TabData[]>([])
  const [tabs, setTabs] = useState<TabData[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [closedTabs, setClosedTabs] = useState<TabData[]>([])
  const [closingTab, setClosingTab] = useState<TabData | null>(null)
  const [showHome, setShowHome] = useState(true)
  const [renamingTab, setRenamingTab] = useState<TabData | null>(null)
  const [newTabName, setNewTabName] = useState('')
  const [mathExpression, setMathExpression] = useState<string | null>(null)

  const isMathExpression = (text: string) => /^[0-9+\-*/xX().^\s]+$/.test(text)

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const { data, error } = await supabase
        .from('math_problems')
        .select(
          'id, name, data, updated_at, last_opened, math_problem_versions(id, data, created_at)'
        )
        .eq('user_id', user.id)
        .order('last_opened', { ascending: false })

      if (error) {
        console.error('Failed to load math problems:', error)
        toast.error('Failed to load math problems')
        return
      }

      if (data) {
        const formatted = data.map((p: any) => {
          const { collaborators, ...appState } = p.data?.appState || {}
          return {
            id: p.id,
            name: p.name,
            updated_at: p.updated_at,
            lastOpened: p.last_opened || p.updated_at,
            data: { elements: p.data?.elements || [], appState },
            history:
              p.math_problem_versions?.map((v: any) => {
                const { collaborators: _c, ...vAppState } =
                  v.data?.appState || {}
                return {
                  id: v.id,
                  created_at: v.created_at,
                  data: {
                    elements: v.data?.elements || [],
                    appState: vAppState,
                  },
                }
              }) || [],
          }
        })
        setProblems(formatted)
      }
    }

    load()
  }, [user])

  const openProblem = async (id: string) => {
    const problem = problems.find((p) => p.id === id)
    if (!problem) return
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('math_problems')
      .update({ last_opened: now })
      .eq('id', id)
    if (error) {
      console.error('Failed to update last opened:', error)
    }
    const updatedProblem = { ...problem, lastOpened: now }
    setProblems((prev) => prev.map((p) => (p.id === id ? updatedProblem : p)))
    setClosedTabs((prev) => prev.filter((t) => t.id !== id))
    setTabs([updatedProblem])
    setActiveTabId(problem.id)
    setShowHome(false)
  }

  const createProblem = async () => {
    if (!user) return
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('math_problems')
      .insert({
        user_id: user.id,
        name: `Problem ${problems.length + 1}`,
        data: { elements: [], appState: {} },
        last_opened: now
      })
      .select('id, name, data, updated_at, last_opened')
      .single()

    if (error) {
      console.error('Failed to create math problem:', error)
      toast.error('Failed to create math problem')
      return
    }

    const { collaborators: _c, ...appState } = data.data?.appState || {}
    const newProblem: TabData = {
      id: data.id,
      name: data.name,
      updated_at: data.updated_at,
      lastOpened: data.last_opened || now,
      data: { elements: data.data?.elements || [], appState },
      history: []
    }
    setProblems((prev) => [...prev, newProblem])
    setTabs([newProblem])
    setActiveTabId(newProblem.id)
    setShowHome(false)
  }

  const addTab = async () => {
    if (!user) return
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('math_problems')
      .insert({
        user_id: user.id,
        name: `Problem ${problems.length + 1}`,
        data: { elements: [], appState: {} },
        last_opened: now
      })
      .select('id, name, data, updated_at, last_opened')
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
      updated_at: data.updated_at,
      lastOpened: data.last_opened || now,
      data: { elements: data.data?.elements || [], appState },
      history: []
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
    setProblems((prev) => [...prev, newTab])
  }

  const handleCloseTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return
    setClosingTab(tab)
  }

  const finalizeCloseTab = async (save: boolean) => {
    if (!closingTab) return
    const id = closingTab.id
    if (save) {
      const { collaborators, ...cleanAppState } = closingTab.data.appState || {}
      const newData = { elements: closingTab.data.elements, appState: cleanAppState }
      const updatedAt = new Date().toISOString()
      await supabase
        .from('math_problems')
        .update({ data: newData, updated_at: updatedAt })
        .eq('id', id)
      setProblems((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, data: newData, updated_at: updatedAt } : p,
        ),
      )
    }
    setTabs((prev) => prev.filter((t) => t.id !== id))
    setClosedTabs((prev) => [...prev, closingTab])
    if (activeTabId === id) {
      const remaining = tabs.filter((t) => t.id !== id)
      setActiveTabId(remaining[0]?.id || '')
    }
    setClosingTab(null)
  }

  const reopenTab = (id: string) => {
    const tab = closedTabs.find((t) => t.id === id)
    if (!tab) return
    setClosedTabs((prev) => prev.filter((t) => t.id !== id))
    setTabs((prev) => [...prev, tab])
    setActiveTabId(tab.id)
  }

  const openRenameTab = (id: string) => {
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return
    setRenamingTab(tab)
    setNewTabName(tab.name)
  }

  const finalizeRenameTab = async () => {
    if (!renamingTab) return
    const newName = newTabName.trim()
    if (!newName || newName === renamingTab.name) {
      setRenamingTab(null)
      return
    }
    setTabs((prev) =>
      prev.map((t) => (t.id === renamingTab.id ? { ...t, name: newName } : t)),
    )
    setProblems((prev) =>
      prev.map((p) => (p.id === renamingTab.id ? { ...p, name: newName } : p)),
    )
    await supabase
      .from('math_problems')
      .update({ name: newName })
      .eq('id', renamingTab.id)
    setRenamingTab(null)
  }

  useEffect(() => {
    if (!activeTabId) return
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('math_problems')
        .select('data, updated_at')
        .eq('id', activeTabId)
        .single()
      if (data) {
        const { collaborators, ...appState } = data.data?.appState || {}
        const fetched = { elements: data.data?.elements || [], appState }
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabId
              ? { ...t, data: fetched, updated_at: data.updated_at }
              : t,
          ),
        )
        setProblems((prev) =>
          prev.map((p) =>
            p.id === activeTabId
              ? { ...p, data: fetched, updated_at: data.updated_at }
              : p,
          ),
        )
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [activeTabId])

    const updateTabData = useCallback(
      async (elements: readonly ExcalidrawElement[], appState: AppState) => {
        const { collaborators, ...cleanAppState } = appState
        const newData = { elements, appState: cleanAppState }
        const updatedAt = new Date().toISOString()
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === activeTabId
              ? { ...tab, data: newData, updated_at: updatedAt }
              : tab,
          ),
        )
        setProblems((prev) =>
          prev.map((p) =>
            p.id === activeTabId
              ? { ...p, data: newData, updated_at: updatedAt }
              : p,
          ),
        )
        const textEl = [...elements]
          .reverse()
          .find((el) => el.type === 'text' && isMathExpression((el as any).text?.trim() || '')) as any
        setMathExpression(textEl ? textEl.text.trim() : null)
        if (activeTabId) {
          await supabase
            .from('math_problems')
            .update({ data: newData, updated_at: updatedAt })
            .eq('id', activeTabId)
        }
      },
      [activeTabId],
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
      t.id === tab.id ? { ...t, history: [...t.history, newVersion] } : t,
    )
    setTabs(newTabs)
    setProblems((prev) =>
      prev.map((p) =>
        p.id === tab.id ? { ...p, history: [...p.history, newVersion] } : p,
      ),
    )
  }

  const restoreVersion = async (versionId: string) => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return
    const version = tab.history.find((h) => h.id === versionId)
    if (!version) return
    const { collaborators, ...cleanAppState } = version.data.appState || {}
    const versionData = { elements: version.data.elements, appState: cleanAppState }
    const updatedAt = new Date().toISOString()
    const newTabs = tabs.map((t) =>
      t.id === tab.id ? { ...t, data: versionData, updated_at: updatedAt } : t,
    )
    setTabs(newTabs)
    setProblems((prev) =>
      prev.map((p) =>
        p.id === tab.id ? { ...p, data: versionData, updated_at: updatedAt } : p,
      ),
    )
    await supabase
      .from('math_problems')
      .update({ data: versionData, updated_at: updatedAt })
      .eq('id', tab.id)
  }

  const activeTab = tabs.find((t) => t.id === activeTabId)

  if (showHome) {
    const hour = new Date().getHours()
    const timeOfDay =
      hour < 12
        ? 'morning'
        : hour < 17
        ? 'afternoon'
        : hour < 22
        ? 'evening'
        : 'night'
    const name =
      profile?.display_name ||
      (user?.user_metadata as any)?.name ||
      user?.email?.split('@')[0] ||
      'friend'

    return (
      <div className="harold-sky w-full max-w-7xl mx-auto space-y-8 text-gray-100 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-900 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-purple-200">
              Welcome, {name}. Good {timeOfDay}!
            </h2>
            <p className="text-sm text-purple-200/70">
              Let's get writing notes or math, or anything else you want to write
              down.
            </p>
          </div>
          <button onClick={createProblem} className="btn-dreamy-primary text-sm">
            Create New Notebook
          </button>
        </div>
        {problems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 space-y-6">
            {[...problems]
              .sort(
                (a, b) =>
                  new Date(b.lastOpened).getTime() -
                  new Date(a.lastOpened).getTime(),
              )
              .map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => openProblem(p.id)}
                  className="mb-6 break-inside-avoid rounded-xl p-4 bg-gradient-to-br from-purple-800/70 via-indigo-800/70 to-blue-800/70 border border-purple-500 shadow-lg hover:shadow-2xl cursor-pointer transition"
                >
                  {idx === 0 && (
                    <div className="mb-1 text-xs uppercase tracking-wide text-purple-300">
                      Most Recent
                    </div>
                  )}
                  <div className="h-32 mb-2 border border-purple-600 rounded bg-gray-900 pointer-events-none excalidraw-preview">
                    <Excalidraw
                      initialData={p.data}
                      viewModeEnabled
                      zenModeEnabled
                      theme="dark"
                    />
                  </div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-purple-300 mt-1">
                    {new Date(p.updated_at).toLocaleString(undefined, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-purple-200/70">No notebooks yet.</p>
        )}
      </div>
    )
  }

  return (
    <div className="harold-sky space-y-4 text-gray-100 bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-900 p-4 sm:p-6 rounded-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setShowHome(true)
            setTabs([])
            setActiveTabId('')
          }}
          className="p-1 rounded-full border border-purple-500 hover:bg-purple-700/20"
          title="Home"
        >
          <Home className="w-5 h-5 text-purple-200" />
        </button>
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap flex-1 pr-32 sm:pr-0">
          {tabs.map((tab) => (
            <div key={tab.id} className="flex items-center">
              <button
                onClick={() => setActiveTabId(tab.id)}
                onDoubleClick={() => openRenameTab(tab.id)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors mr-1 ${
                  tab.id === activeTabId
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700'
                }`}
              >
                {tab.name}
              </button>
              <button
                onClick={() => handleCloseTab(tab.id)}
                className="p-1 rounded-full border border-gray-600 hover:bg-gray-700 mr-2"
                title="Close Tab"
              >
                <X className="w-4 h-4 text-gray-200" />
              </button>
            </div>
          ))}
          <button
            onClick={addTab}
            className="p-1 rounded-full border border-gray-600 hover:bg-gray-700 flex-shrink-0"
            title="New Tab"
          >
            <PlusCircle className="w-5 h-5 text-gray-200" />
          </button>
          {closedTabs.length > 0 && (
            <select
              className="input-dreamy max-w-xs ml-2 flex-shrink-0"
              onChange={(e) => reopenTab(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Reopen
              </option>
              {closedTabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
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
                  {new Date(h.created_at).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </option>
              ))}
          </select>
        )}
        <button
          onClick={saveVersion}
          className="p-1 rounded-full border border-gray-600 hover:bg-gray-700 flex-shrink-0"
          title="Save Version"
        >
          <History className="w-5 h-5 text-gray-200" />
        </button>
      </div>
      <div className="border border-purple-700 rounded-lg bg-gray-900 h-[70vh] sm:h-[600px]">
        {activeTab && (
          <Excalidraw
            key={activeTab.id}
            initialData={activeTab.data}
            onChange={updateTabData}
            theme="dark"
          />
        )}
      </div>
      <MathSolver expression={mathExpression} />
      {renamingTab && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-950 border-2 border-purple-400 rounded-lg p-6 max-w-sm w-full space-y-4 text-center text-purple-100">
            <h2 className="text-lg font-light">Harold and the Purple Crayon Meets Vanilla Sky</h2>
            <input
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              className="input-dreamy w-full text-sm"
              autoFocus
            />
            <div className="space-y-2">
              <button
                onClick={finalizeRenameTab}
                className="btn-dreamy-primary w-full text-sm bg-purple-600 hover:bg-purple-700 border-purple-700 text-white"
              >
                Rename
              </button>
              <button
                onClick={() => setRenamingTab(null)}
                className="btn-dreamy w-full text-sm text-purple-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {closingTab && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-950 border-2 border-purple-400 rounded-lg p-6 max-w-sm w-full space-y-4 text-center text-purple-100">
            <h2 className="text-lg font-light">Harold and the Purple Crayon</h2>
            <p className="text-sm">
              Save <span className="font-semibold">{closingTab.name}</span> before closing?
            </p>
            <div className="space-y-2">
              <button
                onClick={() => finalizeCloseTab(true)}
                className="btn-dreamy-primary w-full text-sm bg-purple-600 hover:bg-purple-700 border-purple-700 text-white"
              >
                Save & Close
              </button>
              <button
                onClick={() => finalizeCloseTab(false)}
                className="btn-dreamy w-full text-sm border-purple-400 text-purple-100 hover:bg-purple-900/50"
              >
                Close Without Saving
              </button>
              <button
                onClick={() => setClosingTab(null)}
                className="btn-dreamy w-full text-sm text-purple-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
