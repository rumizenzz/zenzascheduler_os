import React, { useEffect, useState } from 'react'

interface DragHintProps {
  isMobile: boolean
}

export function DragHint({ isMobile }: DragHintProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('dragHintDismissed')) return
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      localStorage.setItem('dragHintDismissed', 'true')
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl animate-bounce text-sm text-gray-800 z-50">
      {isMobile ? 'Long press then drag a task to reschedule it' : 'Hold \u21E7 Shift and drag a task to reschedule it'}
    </div>
  )
}
