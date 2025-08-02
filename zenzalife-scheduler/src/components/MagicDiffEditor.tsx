import { useEffect, useRef, useState } from 'react';
import type { editor as MonacoEditor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { DiffEditor } from '@monaco-editor/react';

function DiffButton({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-white transition-transform hover:animate-spin"
    >
      <span className="absolute -left-6 top-1/2 -translate-y-1/2 animate-spin text-sky-300">🌀</span>
      {children}
    </button>
  );
}

export default function MagicDiffEditor({ height = '70vh' }: { height?: string }) {
  const editorRef = useRef<MonacoEditor.IStandaloneDiffEditor | null>(null);
  const [sideBySide, setSideBySide] = useState(true);
  const [leftName, setLeftName] = useState('original.ts');
  const [rightName, setRightName] = useState('modified.ts');
  const [editingLeft, setEditingLeft] = useState(false);
  const [editingRight, setEditingRight] = useState(false);

  const getLanguage = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'py':
        return 'python';
      default:
        return 'plaintext';
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const leftModel = editor.getOriginalEditor().getModel();
    const rightModel = editor.getModifiedEditor().getModel();
    if (leftModel) {
      monaco.editor.setModelLanguage(leftModel, getLanguage(leftName));
    }
    if (rightModel) {
      monaco.editor.setModelLanguage(rightModel, getLanguage(rightName));
    }
  }, [leftName, rightName]);

  const handleMount = (editor: MonacoEditor.IStandaloneDiffEditor) => {
    editorRef.current = editor;
  };

  const acceptCurrent = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const value = editor.getOriginalEditor().getModel()?.getValue() ?? '';
    editor.getModifiedEditor().getModel()?.setValue(value);
  };

  const acceptIncoming = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const value = editor.getModifiedEditor().getModel()?.getValue() ?? '';
    editor.getOriginalEditor().getModel()?.setValue(value);
  };

  const acceptBoth = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const originalValue = editor.getOriginalEditor().getModel()?.getValue() ?? '';
    const incomingValue = editor.getModifiedEditor().getModel()?.getValue() ?? '';
    const merged = originalValue ? `${originalValue}\n${incomingValue}` : incomingValue;
    editor.getOriginalEditor().getModel()?.setValue(merged);
    editor.getModifiedEditor().getModel()?.setValue(merged);
  };

  const compareChanges = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const next = !sideBySide;
    editor.updateOptions({ renderSideBySide: next });
    setSideBySide(next);
  };

  return (
    <div className="space-y-4 rounded-lg bg-gradient-to-br from-purple-800 to-sky-600 p-4 text-sm text-white">
      <div className="flex gap-2">
        {editingLeft ? (
          <input
            value={leftName}
            onChange={(e) => setLeftName(e.target.value)}
            onBlur={() => setEditingLeft(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditingLeft(false);
            }}
            className="rounded bg-gradient-to-r from-purple-700 to-sky-500 px-2 py-1 text-white"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => setEditingLeft(true)}
            className="cursor-text rounded bg-gradient-to-r from-purple-700 to-sky-500 px-2 py-1"
          >
            {leftName}
            <span className="ml-2 text-xs text-sky-200">
              ({getLanguage(leftName)})
            </span>
          </button>
        )}
        {editingRight ? (
          <input
            value={rightName}
            onChange={(e) => setRightName(e.target.value)}
            onBlur={() => setEditingRight(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditingRight(false);
            }}
            className="rounded bg-gradient-to-r from-purple-700 to-sky-500 px-2 py-1 text-white"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => setEditingRight(true)}
            className="cursor-text rounded bg-gradient-to-r from-purple-700 to-sky-500 px-2 py-1"
          >
            {rightName}
            <span className="ml-2 text-xs text-sky-200">
              ({getLanguage(rightName)})
            </span>
          </button>
        )}
      </div>
      <DiffEditor
        height={height}
        theme="vs-dark"
        language="typescript"
        original=""
        modified=""
        onMount={handleMount}
        options={{ originalEditable: true }}
      />
      <div className="flex flex-wrap gap-4">
        <DiffButton onClick={acceptCurrent}>Accept Current</DiffButton>
        <DiffButton onClick={acceptIncoming}>Accept Incoming Changes</DiffButton>
        <DiffButton onClick={acceptBoth}>Accept Both Changes</DiffButton>
        <DiffButton onClick={compareChanges}>Compare Changes</DiffButton>
      </div>
    </div>
  );
}

