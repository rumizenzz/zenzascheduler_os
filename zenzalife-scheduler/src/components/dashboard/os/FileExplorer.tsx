import React, { useMemo, useState } from 'react'

interface Props {
  content: string
  onChange: (content: string) => void
}

export function FileExplorer({ content, onChange }: Props) {
  const data = useMemo(() => {
    try {
      return JSON.parse(content) as { files: string[]; folders: string[] }
    } catch {
      return { files: [], folders: [] }
    }
  }, [content])
  const [name, setName] = useState('')

  const addEntry = (type: 'file' | 'folder') => {
    const trimmed = name.trim()
    if (!trimmed) return
    const next = {
      files: type === 'file' ? [...data.files, trimmed] : data.files,
      folders: type === 'folder' ? [...data.folders, trimmed] : data.folders,
    }
    onChange(JSON.stringify(next))
    setName('')
  }

  const removeEntry = (type: 'file' | 'folder', value: string) => {
    const next = {
      files:
        type === 'file' ? data.files.filter((f) => f !== value) : data.files,
      folders:
        type === 'folder'
          ? data.folders.filter((f) => f !== value)
          : data.folders,
    }
    onChange(JSON.stringify(next))
  }

  return (
    <div className="p-2 text-sm flex flex-col h-full">
      <ul className="flex-1 overflow-auto space-y-1 mb-2">
        {data.folders.map((f) => (
          <li
            key={`folder-${f}`}
            className="flex justify-between items-center bg-purple-900/40 px-2 py-1 rounded"
          >
            <span>📁 {f}</span>
            <button
              onClick={() => removeEntry('folder', f)}
              className="text-xs text-red-300 hover:text-red-200"
            >
              X
            </button>
          </li>
        ))}
        {data.files.map((f) => (
          <li
            key={`file-${f}`}
            className="flex justify-between items-center bg-purple-900/40 px-2 py-1 rounded"
          >
            <span>{f}</span>
            <button
              onClick={() => removeEntry('file', f)}
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
          placeholder="New name"
          className="flex-1 px-2 py-1 rounded bg-purple-900/40 focus:outline-none"
        />
        <button
          onClick={() => addEntry('file')}
          className="btn-dreamy-primary text-xs"
        >
          Add File
        </button>
        <button
          onClick={() => addEntry('folder')}
          className="btn-dreamy-secondary text-xs"
        >
          Add Folder
        </button>
      </div>
    </div>
  )
}
