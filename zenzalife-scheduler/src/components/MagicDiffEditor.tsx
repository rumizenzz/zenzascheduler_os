import { useRef, useState } from 'react';
import type { editor as MonacoEditor } from 'monaco-editor';
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

export default function MagicDiffEditor() {
  const editorRef = useRef<MonacoEditor.IStandaloneDiffEditor | null>(null);
  const [sideBySide, setSideBySide] = useState(true);

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
      <DiffEditor
        height="70vh"
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

