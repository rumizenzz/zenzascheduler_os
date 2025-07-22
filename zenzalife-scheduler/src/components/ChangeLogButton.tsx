import React, { useState, useEffect } from 'react'
import { supabase, type ChangeLogEntry } from '@/lib/supabase'
import { List } from 'lucide-react'

export function ChangeLogButton() {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<ChangeLogEntry[]>([])

  useEffect(() => {
    if (!open) return
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('change_log')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setEntries(data as ChangeLogEntry[])
      }
    }
    fetchEntries()
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-20 z-40 btn-dreamy text-xs flex items-center gap-2"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Change Log</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-light text-gray-800 text-center">Latest Updates</h2>
            <ul className="space-y-3 max-h-64 overflow-y-auto text-left">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.created_at || '').toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{entry.message}</p>
                </li>
              ))}
              {!entries.length && (
                <li className="text-gray-600 text-sm">No updates yet.</li>
              )}
            </ul>
            <div className="text-center">
              <button onClick={() => setOpen(false)} className="btn-dreamy-primary px-8">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
