import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { supabase, Task } from '@/lib/supabase'
import { X, CheckSquare, SquarePlus } from 'lucide-react'

interface CompletedTasksModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  onAddTask: (date: string) => void
  refreshTasks: () => Promise<void>
  tasks: Task[]
}

export function CompletedTasksModal({ isOpen, onClose, date, onAddTask, refreshTasks, tasks }: CompletedTasksModalProps) {
  const [dayTasks, setDayTasks] = useState<Task[]>([])

  useEffect(() => {
    if (tasks) {
      const filtered = tasks.filter(t => dayjs(t.start_time).format('YYYY-MM-DD') === date)
      setDayTasks(filtered)
    }
  }, [tasks, date])

  const toggleComplete = async (task: Task) => {
    await supabase.from('tasks').update({ completed: !task.completed, updated_at: new Date().toISOString() }).eq('id', task.id)
    await refreshTasks()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-light text-gray-800">
              Tasks Completed – {dayjs(date).format('MMM D, YYYY')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {dayTasks.length === 0 && (
            <p className="text-gray-600 text-sm">No tasks for this day.</p>
          )}

          <ul className="space-y-2">
            {dayTasks.map(t => (
              <li key={t.id} className="flex items-center gap-2">
                <button onClick={() => toggleComplete(t)} className="p-1">
                  {t.completed ? (
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 border border-gray-400 rounded" />
                  )}
                </button>
                <span className={t.completed ? 'line-through text-gray-500' : ''}>{t.title}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 flex justify-between items-center">
            <button onClick={onClose} className="btn-dreamy">
              Close
            </button>
            <button onClick={() => onAddTask(date)} className="btn-dreamy-primary flex items-center gap-2">
              <SquarePlus className="w-4 h-4" />
              Add Completed Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
