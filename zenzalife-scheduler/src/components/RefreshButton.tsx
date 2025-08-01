import { RefreshCw } from 'lucide-react'
import React from 'react'

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="fixed bottom-4 right-4 z-50 btn-dreamy flex items-center gap-2 px-3 py-2 text-sm sm:text-base"
      aria-label="Refresh"
    >
      <RefreshCw className="w-5 h-5" />
      <span>Refresh</span>
    </button>
  )
}
