import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import * as ICAL from 'ical.js'

interface Props {
  isOpen: boolean
  onClose: () => void
  addressId: string | undefined
  provider: string | undefined
}

export default function IcsUploadModal({ isOpen, onClose, addressId, provider }: Props) {
  const [file, setFile] = useState<File | null>(null)

  if (!isOpen) return null

  const handleUpload = async () => {
    if (!file || !addressId) return
    try {
      const text = await file.text()
      const res = await fetch('/functions/v1/auto-garbage-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId,
          provider: provider || 'manual',
          icsData: text
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      toast.success('Schedule imported')
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-medium mb-4">Upload ICS File</h2>
        <input type="file" accept="text/calendar" onChange={e => setFile(e.target.files?.[0] || null)} />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="btn-dreamy">Cancel</button>
          <button onClick={handleUpload} className="btn-dreamy-primary" disabled={!file}>Import</button>
        </div>
      </div>
    </div>
  )
}
