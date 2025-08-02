import { useEffect, useRef, useState } from 'react'
import type { editor as MonacoEditor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { DiffEditor } from '@monaco-editor/react'

interface DiffNavigator {
  next(): void
  previous(): void
}

interface CommitMeta {
  author: string
  timestamp: string
  message: string
}

interface CommitDiffViewerProps {
  original: string
  modified: string
  originalLabel: string
  modifiedLabel: string
  meta?: CommitMeta
  height?: string
  initialView?: 'split' | 'inline'
}

function ControlButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-500"
    >
      {children}
    </button>
  )
}

interface DiffNavigator {
  next: () => void
  previous: () => void
}

export default function CommitDiffViewer({
  original,
  modified,
  originalLabel,
  modifiedLabel,
  meta,
  height = '70vh',
  initialView = 'split',
}: CommitDiffViewerProps) {
  const editorRef = useRef<MonacoEditor.IStandaloneDiffEditor | null>(null)
  const navigatorRef = useRef<DiffNavigator | null>(null)
  const [sideBySide, setSideBySide] = useState(initialView === 'split')

  const handleMount = (editor: MonacoEditor.IStandaloneDiffEditor) => {
    editorRef.current = editor
    navigatorRef.current = (monaco.editor as any).createDiffNavigator(editor, {
      followsCaret: true,
      ignoreCharChanges: true,
    }) as DiffNavigator
  }

  const acceptCurrent = () => {
    const editor = editorRef.current
    if (!editor) return
    const value = editor.getOriginalEditor().getModel()?.getValue() ?? ''
    editor.getModifiedEditor().getModel()?.setValue(value)
  }

  const acceptIncoming = () => {
    const editor = editorRef.current
    if (!editor) return
    const value = editor.getModifiedEditor().getModel()?.getValue() ?? ''
    editor.getOriginalEditor().getModel()?.setValue(value)
  }

  const compareChanges = () => {
    const editor = editorRef.current
    if (!editor) return
    const next = !sideBySide
    editor.updateOptions({ renderSideBySide: next })
    setSideBySide(next)
  }

  const nextChange = () => navigatorRef.current?.next()
  const prevChange = () => navigatorRef.current?.previous()

  const copyOriginal = async () => {
    const value = editorRef.current?.getOriginalEditor().getModel()?.getValue() ?? ''
    await navigator.clipboard.writeText(value)
  }

  const copyModified = async () => {
    const value = editorRef.current?.getModifiedEditor().getModel()?.getValue() ?? ''
    await navigator.clipboard.writeText(value)
  }

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    editor.updateOptions({ renderSideBySide: sideBySide })
  }, [sideBySide])

  return (
    <div className="space-y-4 rounded-lg bg-gradient-to-br from-purple-800 to-sky-600 p-4 text-sm text-white">
      <header className="space-y-1">
        <div className="text-base font-semibold">
          {originalLabel} ↔ {modifiedLabel}
        </div>
        {meta && (
          <div className="text-xs text-sky-200">
            <div>
              {meta.author} — {meta.timestamp}
            </div>
            <div className="truncate">{meta.message}</div>
          </div>
        )}
      </header>
      <DiffEditor
        height={height}
        theme="vs-dark"
        original={original}
        modified={modified}
        onMount={handleMount}
        options={{ originalEditable: true, renderSideBySide: sideBySide }}
      />
      <div className="flex flex-wrap gap-2">
        <ControlButton onClick={prevChange}>Prev Change</ControlButton>
        <ControlButton onClick={nextChange}>Next Change</ControlButton>
        <ControlButton onClick={acceptCurrent}>Accept Current Change</ControlButton>
        <ControlButton onClick={acceptIncoming}>Accept Incoming Change</ControlButton>
        <ControlButton onClick={compareChanges}>
          {sideBySide ? 'View Inline' : 'View Side-by-Side'}
        </ControlButton>
        <ControlButton onClick={copyOriginal}>Copy Original</ControlButton>
        <ControlButton onClick={copyModified}>Copy Modified</ControlButton>
      </div>
    </div>
  )
}

