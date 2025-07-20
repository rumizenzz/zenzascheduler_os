import React, { createContext, useContext, useState, useCallback } from 'react'

export interface LiveActivity {
  id: string
  title: string
  endTime?: number
}

interface LiveActivityContextValue {
  activity: LiveActivity | null
  start: (activity: LiveActivity) => void
  update: (updates: Partial<LiveActivity>) => void
  end: () => void
}

const LiveActivityContext = createContext<LiveActivityContextValue>({
  activity: null,
  start: () => {},
  update: () => {},
  end: () => {}
})

export const LiveActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activity, setActivity] = useState<LiveActivity | null>(null)

  const start = useCallback((act: LiveActivity) => {
    setActivity(act)
  }, [])

  const update = useCallback((updates: Partial<LiveActivity>) => {
    setActivity(prev => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const end = useCallback(() => setActivity(null), [])

  return (
    <LiveActivityContext.Provider value={{ activity, start, update, end }}>
      {children}
    </LiveActivityContext.Provider>
  )
}

export const useLiveActivity = () => useContext(LiveActivityContext)
