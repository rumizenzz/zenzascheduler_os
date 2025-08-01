import { useState } from 'react';

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
  const [current, setCurrent] = useState('');
  const [incoming, setIncoming] = useState('');

  const acceptCurrent = () => setIncoming(current);
  const acceptIncoming = () => setCurrent(incoming);
  const acceptBoth = () => {
    const merged = current ? `${current}\n${incoming}` : incoming;
    setCurrent(merged);
    setIncoming(merged);
  };

  const diffLines = () => {
    const cur = current.split('\n');
    const inc = incoming.split('\n');
    const max = Math.max(cur.length, inc.length);
    const lines: JSX.Element[] = [];
    for (let i = 0; i < max; i += 1) {
      const c = cur[i];
      const n = inc[i];
      if (c === n) {
        lines.push(
          <div key={i} className="text-white">
            {n ?? ''}
          </div>,
        );
      } else if (c === undefined) {
        lines.push(
          <div key={i} className="text-green-400">
            {n}
          </div>,
        );
      } else if (n === undefined) {
        lines.push(
          <div key={i} className="text-red-400 line-through">
            {c}
          </div>,
        );
      } else {
        lines.push(
          <div key={i} className="text-blue-400">
            {n}
          </div>,
        );
      }
    }
    return lines;
  };

  return (
    <div className="space-y-4 rounded-lg bg-gradient-to-br from-purple-800 to-sky-600 p-4 text-sm text-white">
      <div className="flex gap-4">
        <textarea
          className="h-40 w-1/2 rounded-md bg-black/40 p-2 font-mono"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Current"
        />
        <textarea
          className="h-40 w-1/2 rounded-md bg-black/40 p-2 font-mono"
          value={incoming}
          onChange={(e) => setIncoming(e.target.value)}
          placeholder="Incoming"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <DiffButton onClick={acceptCurrent}>Accept Current</DiffButton>
        <DiffButton onClick={acceptIncoming}>Accept Incoming Changes</DiffButton>
        <DiffButton onClick={acceptBoth}>Accept Both Changes</DiffButton>
        <DiffButton onClick={() => {}}>Compare Changes</DiffButton>
      </div>
      <div className="whitespace-pre-wrap rounded-md bg-black/40 p-2 font-mono">
        {diffLines()}
      </div>
    </div>
  );
}

