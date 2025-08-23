import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Upload, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { gzipSync, gunzipSync } from 'fflate'

interface Props {
  onClose: () => void
}

interface UploadedFile {
  name: string
  path: string
  url: string
  type: string
  key: string
  iv: string
}

export function ZenTransfer({ onClose }: Props) {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f) return
    try {
      const array = new Uint8Array(await f.arrayBuffer())
      const compressed = gzipSync(array)
      const key = crypto.getRandomValues(new Uint8Array(32))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt'])
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, compressed)
      const path = `uploads/${Date.now()}-${f.name}`
      const { error: uploadError } = await supabase.storage
        .from('zentransfer')
        .upload(path, encrypted, { contentType: 'application/octet-stream' })
      if (uploadError) throw uploadError
      const objectUrl = URL.createObjectURL(f)
      setFile({
        name: f.name,
        path,
        url: objectUrl,
        type: f.type,
        key: btoa(String.fromCharCode(...key)),
        iv: btoa(String.fromCharCode(...iv))
      })
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Upload failed')
    }
  }

  async function downloadOriginal() {
    if (!file) return
    const { data, error: downloadError } = await supabase.storage
      .from('zentransfer')
      .download(file.path)
    if (downloadError || !data) {
      setError('Download failed')
      return
    }
    try {
      const key = Uint8Array.from(atob(file.key), c => c.charCodeAt(0))
      const iv = Uint8Array.from(atob(file.iv), c => c.charCodeAt(0))
      const cryptoKey = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt'])
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        await data.arrayBuffer()
      )
      const decompressed = gunzipSync(new Uint8Array(decrypted))
      const blob = new Blob([decompressed], { type: file.type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError('Decryption failed')
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 harold-sky">
      <div className="relative bg-gray-900 text-white rounded-lg shadow-lg w-full max-w-4xl flex">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-purple-200"
          aria-label="Close ZenTransfer"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 p-6 border-r border-gray-700 flex items-center justify-center">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full h-64 border-2 border-dashed border-purple-500 rounded-lg flex items-center justify-center text-center cursor-pointer hover:bg-purple-500/10 transition"
          >
            <div>
              <Upload className="w-12 h-12 mx-auto mb-2" />
              <p>Drop a file here</p>
            </div>
          </div>
        </div>
        <div className="w-1/3 p-6 space-y-2">
          {file ? (
            <>
              <p className="font-bold break-all">{file.name}</p>
              {file.url.match(/\.mp4$/i) && (
                <video controls className="w-full" src={file.url}></video>
              )}
              <button onClick={downloadOriginal} className="btn-dreamy w-full">
                Download
              </button>
              <p className="text-xs break-all">Key: {file.key}</p>
              <p className="text-xs break-all">IV: {file.iv}</p>
            </>
          ) : (
            <p className="text-gray-400">No file uploaded</p>
          )}
          {error && <p className="text-red-400">{error}</p>}
        </div>
      </div>
    </div>,
    document.body
  )
}

