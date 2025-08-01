import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Wrench, Code2, X } from 'lucide-react'
import MagicDiffEditor from './MagicDiffEditor'

export function ToolsButton() {
  const [open, setOpen] = useState(false)
  const [showIDE, setShowIDE] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-16 right-4 z-40 btn-dreamy flex items-center gap-2 px-3 py-2 text-sm"
        aria-label="Tools"
      >
        <Wrench className="w-5 h-5" />
        <span className="hidden sm:inline">Tools</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)}></div>
          <div className="fixed top-28 right-4 z-50 bg-white rounded shadow-lg py-2">
            <button
              onClick={() => {
                setShowIDE(true)
                setOpen(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
            >
              <Code2 className="w-4 h-4" />
              <span>IDE</span>
            </button>
          </div>
        </>
      )}
      {showIDE &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 harold-sky">
            <div className="relative w-full max-w-5xl p-4">
              <button
                onClick={() => setShowIDE(false)}
                className="absolute top-4 right-4 text-white hover:text-purple-200"
                aria-label="Close IDE"
              >
                <X className="w-6 h-6" />
              </button>
              <MagicDiffEditor />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
