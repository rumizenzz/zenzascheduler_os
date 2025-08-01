import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { supabase, type Task, getCurrentUser } from '@/lib/supabase'

export function RemindersButton() {
  const [open, setOpen] = useState(false)
  const [reminders, setReminders] = useState<Task[]>([])
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    const loadReminders = async () => {
      const user = await getCurrentUser()
      if (!user) return
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
      if (data) {
        const tasks = data as Task[]
        setReminders(tasks)
        const today = new Date()
        const special = tasks.some(t => {
          if (!t.start_time || !t.category) return false
          const start = new Date(t.start_time)
          return (
            start.toDateString() === today.toDateString() &&
            (t.category === 'monthsary' || t.category === 'anniversary')
          )
        })
        setCelebrate(special)
      }
    }
    loadReminders()
  }, [])

  const formatCountdown = (date: string) => {
    const diff = new Date(date).getTime() - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const count = reminders.length
  const preview = reminders.slice(0, 3)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-40 btn-dreamy flex items-center gap-2 px-3 py-2 text-sm"
        aria-label="Reminders"
      >
        <Bell className="w-5 h-5" />
        <span className="hidden sm:inline">Reminders</span>
        {count > 0 && (
          <span className="ml-1 rounded-full bg-red-500 text-white text-xs px-2">
            {count}
          </span>
        )}
      </button>
      {celebrate && (
        <div className="fixed top-2 right-2 pointer-events-none z-30">
          <span className="text-3xl animate-bounce">🎉</span>
        </div>
      )}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-full max-w-sm space-y-4 text-purple-100">
            <h2 className="text-lg font-light text-center">Upcoming Reminders</h2>
            <ul className="space-y-2 text-left max-h-64 overflow-y-auto">
              {preview.map(r => (
                <li key={r.id} className="border border-purple-400/30 rounded p-2 text-sm">
                  <div className="font-medium">{r.title}</div>
                  {r.start_time && (
                    <div className="text-purple-200">in {formatCountdown(r.start_time)}</div>
                  )}
                </li>
              ))}
              {!preview.length && (
                <li className="text-sm">No upcoming reminders.</li>
              )}
            </ul>
            {count > 3 && (
              <div className="text-center">
                <button
                  className="underline text-sm"
                  onClick={() => {
                    setOpen(false)
                    window.location.assign('?tab=calendar')
                  }}
                >
                  See All Reminders
                </button>
              </div>
            )}
            <div className="text-center">
              <button className="btn-dreamy-primary px-4 text-sm" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
