import React, { useCallback, useEffect, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import { PlusCircle, History } from 'lucide-react'
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
  history: { id: string; created_at: string; data: ExcalidrawData }[]
}

export function MathNotebookModule() {
  const { user } = useAuth()
  const [tabs, setTabs] = useState<TabData[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const { data, error } = await supabase
        .from('math_problems')
        .select('id, name, data, math_problem_versions(id, data, created_at)')
        .eq('user_id', user.id)
        .order('created_at')

      if (error) {
        console.error('Failed to load math problems:', error)
        toast.error('Failed to load math problems')
        return
      }

      if (data && data.length > 0) {
        const formatted = data.map((p: any) => {
          const { collaborators, ...appState } = p.data?.appState || {}
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
                  data: { elements: v.data?.elements || [], appState: vAppState }
                }
              }) || []
          }
        })
        setTabs(formatted)
        setActiveTabId(formatted[0].id)
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
  }, [user])

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
      <div className="border rounded-lg bg-white h-[70vh] sm:h-[600px]">
        {activeTab && (
          <Excalidraw
            key={activeTab.id}
            initialData={activeTab.data}
            onChange={updateTabData}
          />
        )}
      </div>
    </div>
  )
}
