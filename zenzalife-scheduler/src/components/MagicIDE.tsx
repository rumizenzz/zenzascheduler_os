import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Editor } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { supabase, getCurrentUser } from '../lib/supabase'
import MagicDiffEditor from './MagicDiffEditor'

type IDEFile = {
  id: string
  title: string
  content: string
}

function IDEButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-white transition-transform hover:animate-spin"
    >
      <span className="absolute -left-6 top-1/2 -translate-y-1/2 animate-spin text-sky-300">🌀</span>
      {children}
    </button>
  )
}

export default function MagicIDE({ startDiff = false }: { startDiff?: boolean }) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const [files, setFiles] = useState<IDEFile[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showCloseWarning, setShowCloseWarning] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<{ id: string; content: string; created_at: string }[]>([])
  const [showNewFile, setShowNewFile] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [showDiff, setShowDiff] = useState(startDiff)

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('ide_files')
        .select('id,title,content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setFiles(data)
        setActiveId(data[0].id)
      }
    }
    load()
  }, [])

  const activeFile = files.find((f) => f.id === activeId)

  const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const handleSave = async (saveAs = false) => {
    if (!userId || !editorRef.current) return
    const content = editorRef.current.getValue()
    let file = activeFile
    let title = file?.title || 'untitled'

    if (saveAs || !file) {
      const name = prompt('Filename', title)
      if (!name) return
      title = name
      const { data, error } = await supabase
        .from('ide_files')
        .insert({ user_id: userId, title, content })
        .select()
        .single()
      if (error || !data) return
      setFiles([...files, data])
      setActiveId(data.id)
      file = data
    } else {
      const { error } = await supabase
        .from('ide_files')
        .update({ content })
        .eq('id', file.id)
      if (error) return
      setFiles(files.map((f) => (f.id === file!.id ? { ...f, content } : f)))
    }

    if (file) {
      await supabase.from('ide_file_versions').insert({ file_id: file.id, content })
    }
  }

  const undo = () => editorRef.current?.trigger('source', 'undo', null)
  const redo = () => editorRef.current?.trigger('source', 'redo', null)

  const openHistory = async () => {
    if (!activeFile) return
    const { data } = await supabase
      .from('ide_file_versions')
      .select('id,content,created_at')
      .eq('file_id', activeFile.id)
      .order('created_at', { ascending: false })
    setHistory(data ?? [])
    setShowHistory(true)
  }

  const wordCount = activeFile ? activeFile.content.trim().split(/\s+/).filter(Boolean).length : 0

  const startRename = (file: IDEFile) => {
    setRenameId(file.id)
    setRenameTitle(file.title)
  }

  const confirmRename = async () => {
    const id = renameId
    if (!id) return
    const title = renameTitle.trim()
    if (!title) return cancelRename()
    const { error } = await supabase
      .from('ide_files')
      .update({ title })
      .eq('id', id)
    if (error) return
    setFiles(files.map((f) => (f.id === id ? { ...f, title } : f)))
    setRenameId(null)
    setRenameTitle('')
  }

  const cancelRename = () => {
    setRenameId(null)
    setRenameTitle('')
  }

  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    html: 'html',
    css: 'css',
    py: 'python',
    sh: 'shell',
  }

  const getLanguage = (title: string) => {
    const ext = title.split('.').pop()?.toLowerCase() ?? ''
    return languageMap[ext] || 'plaintext'
  }

  const closeTab = (id: string) => setShowCloseWarning(id)
  const confirmClose = () => {
    const id = showCloseWarning
    if (!id) return
    const remaining = files.filter((f) => f.id !== id)
    setFiles(remaining)
    if (activeId === id) setActiveId(remaining[0]?.id ?? null)
    setShowCloseWarning(null)
  }
  const cancelClose = () => setShowCloseWarning(null)

  const closeWarningPortal =
    showCloseWarning &&
    createPortal(
      <div className="fixed inset-0 z-[1004] flex items-center justify-center bg-black/60 harold-sky">
        <div className="space-y-4 rounded bg-purple-900 p-6">
          <p>Close this tab without saving?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={confirmClose}
              className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-500"
            >
              Close
            </button>
            <button
              onClick={cancelClose}
              className="rounded bg-sky-600 px-3 py-1 text-white hover:bg-sky-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  const createFile = async () => {
    if (!userId) return
    const title = newTitle.trim() || 'untitled'
    const { data, error } = await supabase
      .from('ide_files')
      .insert({ user_id: userId, title, content: '' })
      .select()
      .single()
    if (error || !data) return
    setFiles([...files, data])
    setActiveId(data.id)
    setShowNewFile(false)
    setNewTitle('')
  }

  const newFilePortal =
    showNewFile &&
    createPortal(
      <div className="fixed inset-0 z-[1002] flex items-center justify-center bg-black/60 harold-sky">
        <div className="space-y-4 rounded bg-purple-900 p-6">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Filename"
            className="w-64 rounded bg-sky-700 px-2 py-1 text-white outline-none harold-sky"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={createFile}
              className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-500"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewFile(false)
                setNewTitle('')
              }}
              className="rounded bg-sky-600 px-3 py-1 text-white hover:bg-sky-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  const renamePortal =
    renameId &&
    createPortal(
      <div className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/60 harold-sky">
        <div className="space-y-4 rounded bg-purple-900 p-6">
          <input
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            className="w-64 rounded bg-sky-700 px-2 py-1 text-white outline-none harold-sky"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={confirmRename}
              className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-500"
            >
              Rename
            </button>
            <button
              onClick={cancelRename}
              className="rounded bg-sky-600 px-3 py-1 text-white hover:bg-sky-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  return (
    <div className="space-y-4 rounded-lg bg-gradient-to-br from-purple-800 to-sky-600 p-4 text-sm text-white">
      <div className="flex flex-wrap gap-2">
        {files.map((file) => {
          const ext = file.title.includes('.') ? file.title.split('.').pop() ?? '' : ''
          const name = ext ? file.title.slice(0, -(ext.length + 1)) : file.title
          return (
            <div
              key={file.id}
              onClick={() => setActiveId(file.id)}
              onDoubleClick={() => startRename(file)}
              className={`flex items-center gap-2 rounded-t px-3 py-1 cursor-pointer ${
                file.id === activeId ? 'bg-sky-500 text-white' : 'bg-purple-600 text-white/80'
              }`}
            >
              <>
                <span>{name}</span>
                <span className="rounded bg-sky-700 px-1 text-xs uppercase">{ext || 'txt'}</span>
              </>
              <span
                className="ml-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(file.id)
                }}
              >
                ×
              </span>
            </div>
          )
        })}
        <button
          onClick={() => {
            setNewTitle('')
            setShowNewFile(true)
          }}
          className="rounded bg-purple-700 px-3 py-1"
        >
          +
        </button>
      </div>
      {activeFile && (
        <>
          <Editor
            height="60vh"
            theme="vs-dark"
            language={getLanguage(activeFile.title)}
            value={activeFile.content}
            onMount={handleMount}
            onChange={(value) => {
              const v = value ?? ''
              setFiles(files.map((f) => (f.id === activeFile.id ? { ...f, content: v } : f)))
            }}
          />
          <div className="flex flex-wrap gap-4">
            <IDEButton onClick={() => handleSave(false)}>Save</IDEButton>
            <IDEButton onClick={() => handleSave(true)}>Save As</IDEButton>
            <IDEButton onClick={undo}>Undo</IDEButton>
            <IDEButton onClick={redo}>Redo</IDEButton>
            <IDEButton onClick={openHistory}>History</IDEButton>
            <IDEButton onClick={() => setShowDiff(!showDiff)}>Diff Viewer</IDEButton>
            <span className="ml-auto self-center">Words: {wordCount}</span>
          </div>
          {showDiff && (
            <div className="mt-4">
              <MagicDiffEditor height="30vh" />
            </div>
          )}
        </>
      )}
      {showHistory && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 harold-sky">
          <div className="max-h-[70vh] w-full max-w-md space-y-2 overflow-y-auto rounded bg-purple-900 p-4">
            <button
              className="ml-auto block text-white hover:text-purple-200"
              onClick={() => setShowHistory(false)}
            >
              Close
            </button>
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  setFiles(
                    files.map((f) =>
                      f.id === activeFile?.id ? { ...f, content: h.content } : f,
                    ),
                  )
                  setShowHistory(false)
                }}
                className="block w-full rounded bg-purple-700 p-2 text-left hover:bg-purple-600"
              >
                {new Date(h.created_at).toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      )}
      {newFilePortal}
      {renamePortal}
      {closeWarningPortal}
    </div>
  )
}
