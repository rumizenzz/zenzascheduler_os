import React, { useState, useRef, useEffect } from 'react'
import { X, Clock, Calendar, CheckCircle, GripVertical } from 'lucide-react'
import dayjs from 'dayjs'
import {
  defaultScheduleTemplate,
  DefaultScheduleItem,
} from '@/data/defaultSchedule'
import { categories, getCategoryColor } from '@/data/categories'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { destroyPullToRefresh, initPullToRefresh } from '@/hooks/usePullToRefresh'

interface DefaultScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (date: string, items: DefaultScheduleItem[]) => void
}


export function DefaultScheduleModal({ isOpen, onClose, onApply }: DefaultScheduleModalProps) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [applying, setApplying] = useState(false)
  const [items, setItems] = useState<DefaultScheduleItem[]>(defaultScheduleTemplate)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [reorderEnabled, setReorderEnabled] = useState(false)

  useEffect(() => {
    if (!isOpen || !user) return
    ;(async () => {
      const { data, error } = await supabase
        .from('task_templates')
        .select('tasks')
        .eq('user_id', user.id)
        .eq('name', 'default')
        .maybeSingle()

      if (!error && data?.tasks) {
        setItems(data.tasks as DefaultScheduleItem[])
      }
    })()
    destroyPullToRefresh()
    return () => {
      initPullToRefresh()
    }
  }, [isOpen, user])

  useEffect(() => {
    if (!user) return
    const save = async () => {
      const { error } = await supabase
        .from('task_templates')
        .upsert(
          {
            user_id: user.id,
            name: 'default',
            tasks: items,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,name' }
        )
      if (error) {
        console.error('Failed to save template', error)
      }
    }
    save()
  }, [items, user])

  const updateItem = (index: number, changes: Partial<DefaultScheduleItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...changes } : it)))
  }

  const addItem = () => {
    setItems((prev) => {
      const last = prev[prev.length - 1]
      const defaultStart = last ? last.end : '06:00'
      const start = dayjs(`1970-01-01T${defaultStart}`)
      const end = start.add(60, 'minute')
      return [
        ...prev,
        {
          title: 'New task',
          category: 'other',
          start: start.format('HH:mm'),
          end: end.format('HH:mm'),
        },
      ]
    })
  }

  const reorderItems = (from: number, to: number) => {
    setItems((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)

      const durations = updated.map((it) => {
        const s = dayjs(`1970-01-01T${it.start}`)
        let e = dayjs(`1970-01-01T${it.end}`)
        if (e.isBefore(s)) e = e.add(1, 'day')
        return e.diff(s, 'minute')
      })

      for (let i = 1; i < updated.length; i++) {
        const prevEnd = dayjs(`1970-01-01T${updated[i - 1].end}`)
        let start = prevEnd
        if (start.isBefore(dayjs(`1970-01-01T${updated[i - 1].start}`))) {
          start = start.add(1, 'day')
        }
        const end = start.add(durations[i], 'minute')
        updated[i].start = start.format('HH:mm')
        updated[i].end = end.format('HH:mm')
      }

      return updated
    })
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      await onApply(selectedDate, items)
      onClose()
    } catch (error) {
      console.error('Failed to apply default schedule:', error)
    } finally {
      setApplying(false)
    }
  }

  if (!isOpen) return null

  const formatTime = (t: string) => dayjs(`1970-01-01T${t}`).format('h:mm A')

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-light text-gray-800 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-400" />
                Default Schedule Template
              </h2>
              <p className="text-sm text-gray-600/80 font-light mt-1">
                Apply the complete daily routine designed for 1% better living
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Select Date to Apply Schedule
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-dreamy w-full max-w-xs"
              min={dayjs().format('YYYY-MM-DD')}
            />
          </div>

          {/* Schedule Preview */}
          <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Schedule Overview
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReorderEnabled((v) => !v)}
              className="btn-dreamy text-sm"
            >
              {reorderEnabled ? 'Done Reordering' : 'Enable Reorder'}
            </button>
            {reorderEnabled && (
              <p className="text-sm text-gray-500">
                Long press or hold Shift and drag items to move
              </p>
            )}
          </div>

            <div className="grid gap-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-white/50 rounded-xl border border-white/50"
                  style={{ touchAction: reorderEnabled ? 'none' : 'auto' }}
                  onDragOver={(e) => reorderEnabled && e.preventDefault()}
                  onDrop={() => {
                    if (!reorderEnabled) return
                    if (dragIndex !== null && dragIndex !== index) {
                      reorderItems(dragIndex, index)
                    }
                    setDragIndex(null)
                  }}
                  onPointerEnter={() => {
                    if (!reorderEnabled || dragIndex === null || dragIndex === index) return
                    reorderItems(dragIndex, index)
                    setDragIndex(index)
                  }}
                  onPointerLeave={() => {
                    if (holdTimer.current) {
                      clearTimeout(holdTimer.current)
                      holdTimer.current = null
                    }
                  }}
                >
                  {reorderEnabled && (
                    <div
                      className="mr-1 p-1 cursor-grab active:cursor-grabbing touch-none"
                      draggable={
                        reorderEnabled &&
                        typeof window !== 'undefined' &&
                        !('ontouchstart' in window)
                      }
                      onDragStart={(e) => {
                        if (!reorderEnabled) return
                        setDragIndex(index)
                      }}
                      onDragEnd={() => {
                        if (!reorderEnabled) return
                        setDragIndex(null)
                      }}
                      onPointerDown={() => {
                        if (!reorderEnabled) return
                        holdTimer.current = setTimeout(() => setDragIndex(index), 300)
                      }}
                      onPointerUp={() => {
                        if (holdTimer.current) {
                          clearTimeout(holdTimer.current)
                          holdTimer.current = null
                        }
                        if (dragIndex !== null) {
                          setDragIndex(null)
                        }
                      }}
                    >
                      <GripVertical className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  ></div>
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-600 min-w-[150px]">
                    <input
                      type="time"
                      value={item.start}
                      onChange={(e) => updateItem(index, { start: e.target.value })}
                      className="input-dreamy w-24"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={item.end}
                      onChange={(e) => updateItem(index, { end: e.target.value })}
                      className="input-dreamy w-24"
                    />
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                    className="input-dreamy flex-1 text-sm"
                  />
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(index, { category: e.target.value })}
                    className="input-dreamy text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="btn-dreamy mt-4">Add Item</button>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button onClick={onClose} className="btn-dreamy">
              Cancel
            </button>

            <button onClick={handleApply} disabled={applying} className="btn-dreamy-primary flex items-center gap-2">
              {applying ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Apply Schedule to {dayjs(selectedDate).format('MMM D, YYYY')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
