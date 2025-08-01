import React from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  enabled: boolean
  toggle: () => void
}

export function PullToRefreshToggleButton({ enabled, toggle }: Props) {
  return (
    <button
      onClick={toggle}
      className={`fixed bottom-16 right-4 z-40 flex items-center gap-2 text-xs ${enabled ? 'btn-dreamy-primary' : 'btn-dreamy'}`}
      title="Harold and the Purple Crayon/Vanilla Sky"
    >
      <RefreshCw className="w-4 h-4" />
      <span className="hidden sm:inline">Harold & Vanilla Sky</span>
    </button>
  )
}

