import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import dayjs from 'dayjs'
import { Bell } from 'lucide-react'
import {
  supabase,
  type Reminder,
  type Task,
  getCurrentUser
} from '@/lib/supabase'

const wasteLabels: Record<string, string> = {
  trash: 'Garbage',
  recycling: 'Recycling',
  yard_waste: 'Yard Waste',
  bulk: 'Bulk Items',
  hazardous: 'Hazardous Waste'
}

type GarbageSchedule = {
  id: string
  waste_type: string
  next_collection: string
}

export function RemindersButton() {
  const [open, setOpen] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [celebrate, setCelebrate] = useState(false)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [category, setCategory] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    const user = await getCurrentUser()
    if (!user) return
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', false)
      .gt('remind_at', new Date().toISOString())
      .order('remind_at', { ascending: true })
    const { data: taskData } = await supabase
      .from('tasks')
      .select('id,title,start_time,category')
      .eq('user_id', user.id)
      .eq('completed', false)
      .gt('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })

    const map = new Map<string, Reminder>()
    ;(data as Reminder[] | null)?.forEach(r => {
      map.set(`${r.title}-${r.remind_at}`, r)
    })
    taskData?.forEach(t => {
      if (!t.start_time) return
      const key = `${t.title}-${t.start_time}`
      if (!map.has(key)) {
        map.set(key, {
          id: `task-${t.id}`,
          user_id: user.id,
          title: t.title,
          category: (t as Task).category,
          remind_at: t.start_time
        })
      }
    })

    const todayIso = dayjs().format('YYYY-MM-DD')
    const { data: garbageData } = await supabase
      .from('garbage_schedule')
      .select('id,waste_type,next_collection')
      .eq('user_id', user.id)
      .gte('next_collection', todayIso)
      .order('next_collection', { ascending: true })

    ;(garbageData as GarbageSchedule[] | null)?.forEach(g => {
      const dateIso = dayjs(g.next_collection).startOf('day').toISOString()
      const title = wasteLabels[g.waste_type] || 'Garbage'
      const key = `${title}-${dateIso}`
      if (!map.has(key)) {
        map.set(key, {
          id: `garbage-${g.id}`,
          user_id: user.id,
          title,
          category: g.waste_type,
          remind_at: dateIso
        })
      }
    })

    const list = Array.from(map.values())
    const now = dayjs()
    const startOfMonth = now.startOf('month')
    const firstSunday = startOfMonth.add((7 - startOfMonth.day()) % 7, 'day')

    const { data: activeFast } = await supabase
      .from('fasts')
      .select('start_time,duration_hours')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (activeFast) {
      const end = dayjs(activeFast.start_time).add(activeFast.duration_hours, 'hour')
      if (end.isAfter(now)) {
        list.push({
          id: 'fast-active',
          user_id: user.id,
          title: 'Fast ends',
          remind_at: end.toISOString()
        })
      }
    } else if (firstSunday.isAfter(now)) {
      list.push({
        id: 'fast-reminder',
        user_id: user.id,
        title: 'Intermittent Fasting & Prayer',
        remind_at: firstSunday.toISOString()
      })
    }

    const future = list.filter(r => dayjs(r.remind_at).isAfter(now))
    future.sort(
      (a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime()
    )

    setReminders(future)
    const today = new Date()
    const special = future.some(r => {
      const remind = new Date(r.remind_at)
      return (
        remind.toDateString() === today.toDateString() &&
        (r.category === 'monthsary' || r.category === 'anniversary')
      )
    })
    setCelebrate(special)
  }

  const saveReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = await getCurrentUser()
    if (!user) return
    const iso = new Date(remindAt).toISOString()
    await supabase.from('reminders').insert({
      user_id: user.id,
      title,
      category: category || null,
      remind_at: iso
    })
    await supabase.from('tasks').insert({
      user_id: user.id,
      title,
      category: category || null,
      start_time: iso,
      end_time: iso,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setAdding(false)
    setTitle('')
    setRemindAt('')
    setCategory('')
    loadReminders()
  }

  const formatCountdown = (date: string) => {
    const diff = Math.max(new Date(date).getTime() - Date.now(), 0)
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
        onClick={() => {
          loadReminders()
          setOpen(true)
        }}
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
            {adding ? (
              <form onSubmit={saveReminder} className="space-y-2 text-left">
                <input
                  className="w-full p-2 rounded bg-purple-900/50 border border-purple-400/30 text-purple-100 text-sm"
                  placeholder="Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                <input
                  type="datetime-local"
                  className="w-full p-2 rounded bg-purple-900/50 border border-purple-400/30 text-purple-100 text-sm"
                  value={remindAt}
                  onChange={e => setRemindAt(e.target.value)}
                  required
                />
                <select
                  className="w-full p-2 rounded bg-purple-900/50 border border-purple-400/30 text-purple-100 text-sm"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="monthsary">Monthsary</option>
                  <option value="anniversary">1 Year Anniversary</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="underline text-sm"
                    onClick={() => setAdding(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-dreamy-primary px-3 text-sm">
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                <ul className="space-y-2 text-left max-h-64 overflow-y-auto">
                  {preview.map(r => (
                    <li key={r.id} className="border border-purple-400/30 rounded p-2 text-sm">
                      <div className="font-medium">{r.title}</div>
                      {r.remind_at && (
                        <div className="text-purple-200">in {formatCountdown(r.remind_at)}</div>
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
                      onClick={() => setShowAll(true)}
                    >
                      See All Reminders
                    </button>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <button
                    className="underline text-sm"
                    onClick={() => setAdding(true)}
                  >
                    Add Reminder
                  </button>
                  <button
                    className="btn-dreamy-primary px-4 text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showAll &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
            <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-full max-w-sm space-y-4 text-purple-100">
              <h2 className="text-lg font-light text-center">All Reminders</h2>
              <ul className="space-y-2 text-left max-h-72 overflow-y-auto">
                {reminders.map(r => (
                  <li key={r.id} className="border border-purple-400/30 rounded p-2 text-sm">
                    <div className="font-medium">{r.title}</div>
                    {r.remind_at && (
                      <div className="text-purple-200">in {formatCountdown(r.remind_at)}</div>
                    )}
                  </li>
                ))}
                {!reminders.length && (
                  <li className="text-sm">No upcoming reminders.</li>
                )}
              </ul>
              <div className="text-center">
                <button
                  className="btn-dreamy-primary px-4 text-sm"
                  onClick={() => setShowAll(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
