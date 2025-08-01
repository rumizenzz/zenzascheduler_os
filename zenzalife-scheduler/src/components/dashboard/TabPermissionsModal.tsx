import React, { useState } from 'react'
import { User } from '@/lib/supabase'

const availableTabs = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'math', label: 'Math Notebook' },
  { id: 'logistics', label: 'Life Logistics' },
  { id: 'spiritual', label: 'Spiritual Study' }
]

export interface TabPermissions {
  [key: string]: boolean
}

interface TabPermissionsModalProps {
  member: User
  current?: TabPermissions
  onSave: (perms: TabPermissions) => void
  onClose: () => void
}

export function TabPermissionsModal({
  member,
  current = {},
  onSave,
  onClose
}: TabPermissionsModalProps) {
  const [local, setLocal] = useState<TabPermissions>(current)

  const toggle = (id: string) => {
    setLocal(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const requestAll = () => {
    const all = availableTabs.reduce((acc, t) => ({ ...acc, [t.id]: true }), {})
    setLocal(all)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-medium text-gray-800">
          Manage Tab Access for {member.display_name}
        </h3>

        <button
          onClick={requestAll}
          className="text-sm text-blue-600 underline"
        >
          Request All Tabs
        </button>

        <div className="space-y-2">
          {availableTabs.map(tab => (
            <label key={tab.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!local[tab.id]}
                onChange={() => toggle(tab.id)}
                className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{tab.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(local)}
            className="btn-dreamy text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
