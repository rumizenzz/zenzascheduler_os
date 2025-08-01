import React, { useState, useEffect } from 'react'
import {
  supabase,
  type ChangeLogEntry,
  getCurrentUser,
  getLastSeenChangelog,
  updateLastSeenChangelog
} from '@/lib/supabase'
import { List } from 'lucide-react'
import toast from 'react-hot-toast'

export function ChangeLogButton() {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<ChangeLogEntry[]>([])
  const [changelogText, setChangelogText] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!open) return
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('change_log')
        .select('id, version, title, message, tags, author, icon_url, media_url, created_at')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setEntries(data as ChangeLogEntry[])
      }
    }
    const fetchChangelog = async () => {
      try {
        const res = await fetch('/CHANGELOG.md')
        if (res.ok) {
          const text = await res.text()
          setChangelogText(text)
        }
      } catch (err) {
        console.error('Error loading CHANGELOG:', err)
      }
    }
    fetchEntries()
    fetchChangelog()
  }, [open])

  useEffect(() => {
    const checkLatest = async () => {
      const { data } = await supabase
        .from('change_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
      if (data && data[0]) {
        const latest = data[0]
        const user = await getCurrentUser()
        const lastSeen = user ? await getLastSeenChangelog(user.id) : null
        if (!lastSeen || new Date(lastSeen).getTime() < new Date(latest.created_at).getTime()) {
          toast((t) => (
            <span>
              <b>What's new:</b> {latest.title}
              <button
                className="ml-2 underline"
                onClick={() => {
                  setOpen(true)
                  toast.dismiss(t.id)
                }}
              >
                View
              </button>
            </span>
          ))
        }
      }
    }
    checkLatest()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-28 right-4 z-40 btn-dreamy text-xs flex items-center gap-2"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Change Log</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-xl font-light text-gray-800 text-center">Latest Updates</h2>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search updates"
              className="border rounded px-2 py-1 w-full text-sm"
            />
            <ul className="space-y-3 max-h-64 overflow-y-auto text-left">
              {entries
                .filter((e) =>
                  filter
                    ? e.title.toLowerCase().includes(filter.toLowerCase()) ||
                      (e.message || '').toLowerCase().includes(filter.toLowerCase()) ||
                      (e.tags || []).some((t) => t.toLowerCase().includes(filter.toLowerCase()))
                    : true
                )
                .map((entry) => (
                <li key={entry.id} id={entry.id} className="border p-2 rounded shadow-sm space-y-1">
                  <div className="text-sm text-gray-500">
                    {new Date(entry.created_at || '').toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.icon_url && <img src={entry.icon_url} className="w-4 h-4" alt="" />}
                    <span className="font-medium">{entry.title}</span>
                  </div>
                  {entry.message && <p className="text-gray-700 whitespace-pre-line">{entry.message}</p>}
                  {entry.tags && (
                    <div className="flex flex-wrap gap-1 text-xs">
                      {entry.tags.map((t) => (
                        <span key={t} className="bg-gray-100 px-1 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              {!entries.length && (
                <li className="text-gray-600 text-sm">No updates yet.</li>
              )}
            </ul>
            {changelogText && (
              <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-y-auto border-t pt-2">
                {changelogText}
              </pre>
            )}
            <div className="text-center">
              <button
                onClick={async () => {
                  const user = await getCurrentUser()
                  if (user) {
                    await updateLastSeenChangelog(
                      user.id,
                      entries[0]?.created_at || new Date().toISOString()
                    )
                  }
                  setOpen(false)
                }}
                className="btn-dreamy-primary px-8"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
