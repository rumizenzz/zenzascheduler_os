import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Props {
  sidebarCollapsed: boolean
  isMobile: boolean
}

export function ReportBugButton({ sidebarCollapsed, isMobile }: Props) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const left = sidebarCollapsed ? (isMobile ? '1rem' : '5rem') : '17rem'
  const submitBug = async () => {
    if (!description.trim()) return
    const { error } = await supabase.from('bugs').insert({ description })
    if (error) {
      toast.error('Failed to report bug')
    } else {
      toast.success('Bug reported')
      setDescription('')
      setOpen(false)
    }
  }
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 z-40 btn-dreamy flex items-center gap-2 text-xs"
        style={{ left }}
        title="Report a Bug"
      >
        <BugIcon className="w-4 h-4 text-purple-600" />
        <span className="hidden sm:inline">Report Bug</span>
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 space-y-3 w-full max-w-sm text-purple-100">
            <h2 className="text-lg font-light text-center">Report a Bug</h2>
            <textarea
              className="border rounded w-full p-2 text-sm text-gray-800"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue"
            />
            <div className="flex justify-end gap-2">
              <button className="btn-dreamy text-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn-dreamy-primary text-sm" onClick={submitBug}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BugIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  )
}
