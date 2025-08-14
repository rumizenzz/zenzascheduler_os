import React, { useMemo, useState } from 'react'

interface Props {
  content: string
  onChange: (content: string) => void
}

export function FileExplorer({ content, onChange }: Props) {
  const data = useMemo(() => {
    try {
      return JSON.parse(content) as { files: string[] }
    } catch {
      return { files: [] }
    }
  }, [content])
  const [name, setName] = useState('')

  const addFile = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const next = [...data.files, trimmed]
    onChange(JSON.stringify({ files: next }))
    setName('')
  }

  const removeFile = (file: string) => {
    const next = data.files.filter((f) => f !== file)
    onChange(JSON.stringify({ files: next }))
  }

  return (
    <div className="p-2 text-sm flex flex-col h-full">
      <ul className="flex-1 overflow-auto space-y-1 mb-2">
        {data.files.map((f) => (
          <li
            key={f}
            className="flex justify-between items-center bg-purple-900/40 px-2 py-1 rounded"
          >
            <span>{f}</span>
            <button
              onClick={() => removeFile(f)}
              className="text-xs text-red-300 hover:text-red-200"
            >
              X
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New file name"
          className="flex-1 px-2 py-1 rounded bg-purple-900/40 focus:outline-none"
        />
        <button onClick={addFile} className="btn-dreamy-primary text-xs">
          Add
        </button>
      </div>
    </div>
  )
}
