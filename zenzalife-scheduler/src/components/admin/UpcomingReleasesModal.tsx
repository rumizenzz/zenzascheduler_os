import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function UpcomingReleasesModal({ onClose }: { onClose: () => void }) {
  const [version, setVersion] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [plannedDate, setPlannedDate] = useState('')

  const submit = async () => {
    await supabase.from('upcoming_releases').insert({
      version,
      title,
      description,
      planned_date: plannedDate || null
    })
    setVersion('')
    setTitle('')
    setDescription('')
    setPlannedDate('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 space-y-3 w-full max-w-md">
        <h2 className="text-lg font-medium text-center">Add Upcoming Release</h2>
        <input
          className="border p-1 w-full"
          placeholder="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        />
        <input
          className="border p-1 w-full"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-1 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="border p-1 w-full"
          type="date"
          value={plannedDate}
          onChange={(e) => setPlannedDate(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-dreamy text-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-dreamy-primary text-sm" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
