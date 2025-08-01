import { RefreshCw } from 'lucide-react'
import React from 'react'

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="fixed top-4 right-4 z-40 btn-dreamy text-xs flex items-center gap-2"
      aria-label="Refresh"
    >
      <RefreshCw className="w-4 h-4" />
      <span className="hidden sm:inline">Refresh</span>
    </button>
  )
}
