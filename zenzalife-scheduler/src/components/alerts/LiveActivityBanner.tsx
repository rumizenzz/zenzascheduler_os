import React, { useEffect, useState } from 'react'
import { useLiveActivity } from '@/contexts/LiveActivityContext'

export function LiveActivityBanner() {
  const { activity, end } = useLiveActivity()
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!activity?.endTime) return
    const tick = () => {
      const diff = Math.max(0, Math.floor((activity.endTime! - Date.now()) / 1000))
      setRemaining(diff)
      if (diff === 0) end()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activity, end])

  if (!activity) return null

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const countdown = activity.endTime
    ? `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : null

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-xl shadow-xl px-4 py-2 flex items-center gap-4">
        <div className="text-sm text-gray-800">
          <div className="font-medium">{activity.title}</div>
          {countdown && <div className="text-xs text-gray-600">{countdown} remaining</div>}
        </div>
        <button onClick={end} className="btn-dreamy-secondary px-3 py-1 text-sm">Dismiss</button>
      </div>
    </div>
  )
}
