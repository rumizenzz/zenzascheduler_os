import React, { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

async function compressFile(file: File): Promise<Uint8Array> {
  if ('CompressionStream' in window) {
    const stream = file.stream().pipeThrough(new CompressionStream('gzip'))
    const arrayBuffer = await new Response(stream).arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }
  return new Uint8Array(await file.arrayBuffer())
}

async function decompressData(data: Uint8Array): Promise<Uint8Array> {
  if ('DecompressionStream' in window) {
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))
    const arrayBuffer = await new Response(stream).arrayBuffer()
    return new Uint8Array(arrayBuffer)
  }
  return data
}

const SECRET = import.meta.env.VITE_ZENTRANSFER_SECRET || 'zenzalife-secret'

async function getKey() {
  const encoder = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(SECRET))
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

async function encryptData(data: Uint8Array): Promise<Uint8Array> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  const out = new Uint8Array(iv.byteLength + encrypted.byteLength)
  out.set(iv, 0)
  out.set(new Uint8Array(encrypted), iv.byteLength)
  return out
}

async function decryptData(data: Uint8Array): Promise<Uint8Array> {
  const key = await getKey()
  const iv = data.slice(0, 12)
  const encrypted = data.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
  return new Uint8Array(decrypted)
}

export function ZenTransferModule() {
  const [files, setFiles] = useState<{ name: string; path: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    const { data } = await supabase.storage.from('zen-transfer').list()
    setFiles(data?.map((f) => ({ name: f.name, path: f.name })) || [])
  }, [])

  useEffect(() => {
    supabase.functions.invoke('ensure-zen-transfer-bucket')
    refresh()
  }, [refresh])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const compressed = await compressFile(file)
      const encrypted = await encryptData(compressed)
      const path = `${Date.now()}-${file.name}.enc`
      const { error } = await supabase.storage
        .from('zen-transfer')
        .upload(path, encrypted, {
          contentType: 'application/octet-stream',
        })
      if (error) throw error
      await refresh()
    } catch (err) {
      console.error('upload error', err)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) await handleUpload(file)
  }

  const downloadFile = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from('zen-transfer').download(path)
    if (error || !data) return
    const encrypted = new Uint8Array(await data.arrayBuffer())
    const decrypted = await decryptData(encrypted)
    const decompressed = await decompressData(decrypted)
    const blob = new Blob([decompressed])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 text-purple-100">
      <div className="grid md:grid-cols-2 gap-6">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="harold-sky border-2 border-dashed border-purple-400 rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <p className="mb-4">Drop files here or click to upload</p>
          {uploading && <p className="text-sm text-purple-300">Uploading...</p>}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
          />
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {files.map((f) => (
            <div
              key={f.path}
              className="harold-sky flex items-center justify-between p-3 rounded-lg"
            >
              <span className="truncate mr-2">{f.name.replace(/\.enc$/, '')}</span>
              <button
                className="btn-dreamy-primary text-xs px-3 py-1"
                onClick={() => downloadFile(f.path, f.name.replace(/\.enc$/, ''))}
              >
                Download
              </button>
            </div>
          ))}
          {files.length === 0 && (
            <p className="text-sm text-purple-300">No files uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

