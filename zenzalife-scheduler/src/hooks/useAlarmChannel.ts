import { useEffect, useRef } from 'react'

export interface AlarmMessage {
  type: 'dismiss' | 'snooze'
  payload?: any
}

export function useAlarmChannel(onMessage: (msg: AlarmMessage) => void) {
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    if ('BroadcastChannel' in window) {
      const ch = new BroadcastChannel('zenza-alarm')
      ch.onmessage = e => onMessage(e.data as AlarmMessage)
      channelRef.current = ch
      return () => ch.close()
    }

    const handler = (e: StorageEvent) => {
      if (e.key === 'zenza-alarm' && e.newValue) {
        try {
          const msg = JSON.parse(e.newValue) as AlarmMessage
          onMessage(msg)
        } catch {
          // ignore JSON parse errors
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [onMessage])

  const postMessage = (msg: AlarmMessage) => {
    channelRef.current?.postMessage(msg)
    try {
      localStorage.setItem('zenza-alarm', JSON.stringify(msg))
      localStorage.removeItem('zenza-alarm')
    } catch {
      // ignore storage errors
    }
  }

  return { postMessage }
}
