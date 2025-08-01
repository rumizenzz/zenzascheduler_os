import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import type { Fast } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function FastingPrayerReminder() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [duration, setDuration] = useState(24)
  const [allowWater, setAllowWater] = useState(true)
  const [activeFast, setActiveFast] = useState<Fast | null>(null)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!user) return
    async function fetchActiveFast() {
      const { data, error } = await supabase
        .from('fasts')
        .select('id,user_id,start_time,duration_hours,allow_water')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) {
        console.error('Failed to fetch active fast', error)
        return
      }
      if (data) {
        const end = dayjs(data.start_time).add(data.duration_hours, 'hour')
        if (dayjs().isBefore(end)) {
          setActiveFast(data as Fast)
        }
      }
    }
    fetchActiveFast()
  }, [user])

  useEffect(() => {
    if (!activeFast) return
    const end = dayjs(activeFast.start_time).add(activeFast.duration_hours, 'hour')
    function update() {
      const diff = end.diff(dayjs(), 'second')
      if (diff <= 0) {
        setActiveFast(null)
        setTimeLeft('')
        return
      }
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [activeFast])

  useEffect(() => {
    async function remind() {
      const today = dayjs()
      if (today.date() !== 1) return

      if (user) {
        const start = today.startOf('month').toISOString()
        const end = today.endOf('month').toISOString()
        const { data, error } = await supabase
          .from('fasts')
          .select('id')
          .eq('user_id', user.id)
          .gte('start_time', start)
          .lte('start_time', end)
          .maybeSingle()
        if (error) {
          console.error('Failed to check fasts', error)
        }
        if (data) return
      }

      toast.custom(
        t => (
          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-4">
            <span className="text-sm font-light text-gray-800">
              Reminder: Time to do Intermittent Fasting and Prayer
            </span>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                setShowModal(true)
              }}
              className="px-3 py-1 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600 transition"
            >
              Start
            </button>
          </div>
        ),
        { duration: 10000, position: 'top-right' }
      )
    }
    remind()
  }, [user])

  async function startFast(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to save your fast')
      return
    }

    const start = new Date().toISOString()
    const { data, error } = await supabase
      .from('fasts')
      .insert({
        user_id: user.id,
        start_time: start,
        duration_hours: duration,
        allow_water: allowWater,
      })
      .select()
      .single()
    if (error) {
      console.error('Failed to save fast', error)
      toast.error('Failed to save fast')
      return
    }

    setActiveFast(data as Fast)
    setShowModal(false)
    toast.success('Fasting plan saved')
  }

  return (
    <>
      {activeFast && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Fast ends in: {timeLeft}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={startFast}
            className="bg-white rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Intermittent Fasting & Prayer
            </h2>
            <p className="text-sm text-gray-600">
              "For we wrestle not against flesh and blood, but against principalities..." (Ephesians 6:12)
            </p>
            <label className="block text-sm">
              Duration
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="mt-1 w-full border rounded p-2"
              >
                <option value={24}>24 hours</option>
                <option value={96}>4 days</option>
                <option value={168}>7 days</option>
              </select>
            </label>
            <label className="block text-sm">
              Water
              <select
                value={allowWater ? 'water' : 'dry'}
                onChange={e => setAllowWater(e.target.value === 'water')}
                className="mt-1 w-full border rounded p-2"
              >
                <option value="water">Water only (no food)</option>
                <option value="dry">No food or drink</option>
              </select>
            </label>
            <p className="text-xs text-red-600">
              Do not attempt a 40-day fast. Consult a health professional before extended fasting and use wisdom.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1 text-sm rounded-md border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

