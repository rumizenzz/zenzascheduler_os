import React, { useEffect, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/dist/excalidraw.min.css'
import { PlusCircle, History } from 'lucide-react'

type ExcalidrawData = {
  elements: unknown
  appState: unknown
}

interface TabData {
  id: string
  name: string
  data: ExcalidrawData
  history: { timestamp: number; data: ExcalidrawData }[]
}

const STORAGE_KEY = 'math-notebook-tabs'

export function MathNotebookModule() {
  const [tabs, setTabs] = useState<TabData[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed: TabData[] = JSON.parse(stored)
      setTabs(parsed)
      setActiveTabId(parsed[0]?.id || '')
    } else {
      const initial: TabData = {
        id: `tab-${Date.now()}`,
        name: 'Problem 1',
        data: { elements: [], appState: {} },
        history: []
      }
      setTabs([initial])
      setActiveTabId(initial.id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify([initial]))
    }
  }, [])

  const saveTabs = (newTabs: TabData[]) => {
    setTabs(newTabs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTabs))
  }

  const addTab = () => {
    const newTab: TabData = {
      id: `tab-${Date.now()}`,
      name: `Problem ${tabs.length + 1}`,
      data: { elements: [], appState: {} },
      history: []
    }
    const newTabs = [...tabs, newTab]
    saveTabs(newTabs)
    setActiveTabId(newTab.id)
  }

  const updateTabData = (elements: unknown, appState: unknown) => {
    const newTabs = tabs.map((tab) =>
      tab.id === activeTabId ? { ...tab, data: { elements, appState } } : tab
    )
    saveTabs(newTabs)
  }

  const saveVersion = () => {
    const newTabs = tabs.map((tab) => {
      if (tab.id !== activeTabId) return tab
      const historyEntry = { timestamp: Date.now(), data: tab.data }
      return { ...tab, history: [...tab.history, historyEntry] }
    })
    saveTabs(newTabs)
  }

  const restoreVersion = (timestamp: number) => {
    const newTabs = tabs.map((tab) => {
      if (tab.id !== activeTabId) return tab
      const version = tab.history.find((h) => h.timestamp === timestamp)
      if (!version) return tab
      return { ...tab, data: version.data }
    })
    saveTabs(newTabs)
  }

  const activeTab = tabs.find((t) => t.id === activeTabId)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
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
          className="p-1 rounded-full border border-gray-300 hover:bg-white"
          title="New Tab"
        >
          <PlusCircle className="w-5 h-5 text-gray-700" />
        </button>
        {activeTab && activeTab.history.length > 0 && (
          <select
            className="ml-auto input-dreamy max-w-xs"
            onChange={(e) => restoreVersion(Number(e.target.value))}
            defaultValue=""
          >
            <option value="" disabled>
              History
            </option>
            {activeTab.history
              .slice()
              .reverse()
              .map((h) => (
                <option key={h.timestamp} value={h.timestamp}>
                  {new Date(h.timestamp).toLocaleString()}
                </option>
              ))}
          </select>
        )}
        <button
          onClick={saveVersion}
          className="p-1 rounded-full border border-gray-300 hover:bg-white"
          title="Save Version"
        >
          <History className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      <div className="border rounded-lg h-[600px] bg-white">
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
