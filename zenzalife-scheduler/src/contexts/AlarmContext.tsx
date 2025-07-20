import React, { createContext, useContext, useState, useEffect } from 'react'
import { builtInAlarms } from '@/alarms'

export interface AlarmSound {
  id: string
  name: string
  src: string
}

interface AlarmContextValue {
  sounds: AlarmSound[]
  defaultSoundId: string
  setDefaultSoundId: (id: string) => void
  registerSound: (sound: AlarmSound) => void
}

const AlarmContext = createContext<AlarmContextValue | undefined>(undefined)

export const useAlarmContext = () => {
  const ctx = useContext(AlarmContext)
  if (!ctx) throw new Error('AlarmContext not found')
  return ctx
}

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [sounds, setSounds] = useState<AlarmSound[]>([])
  const [defaultSoundId, setDefaultSoundId] = useState('')

  const registerSound = (sound: AlarmSound) => {
    setSounds(prev => {
      if (prev.find(s => s.id === sound.id)) return prev
      return [...prev, sound]
    })
    if (!defaultSoundId) setDefaultSoundId(sound.id)
  }

  useEffect(() => {
    builtInAlarms.forEach(registerSound)
  }, [])

  const value: AlarmContextValue = {
    sounds,
    defaultSoundId,
    setDefaultSoundId,
    registerSound
  }

  return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>
}
