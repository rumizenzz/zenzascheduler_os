import React, { useState } from 'react'

interface Props {
  content: string
  onChange: (content: string) => void
}

export function TerminalApp({ content, onChange }: Props) {
  const [input, setInput] = useState('')
  const history = content ? content.split('\n') : []

  const runCommand = (cmd: string) => {
    const [command, ...args] = cmd.trim().split(' ')
    let output = ''
    switch (command) {
      case 'help':
        output = 'Available commands: help, echo'
        break
      case 'echo':
        output = args.join(' ')
        break
      case '':
        output = ''
        break
      default:
        output = `Command not found: ${command}`
    }
    const next = [...history, `> ${cmd}`, output]
    onChange(next.join('\n'))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runCommand(input)
    setInput('')
  }

  return (
    <div className="p-2 text-sm flex flex-col h-full">
      <div className="flex-1 overflow-auto mb-2 whitespace-pre-wrap">
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <span className="select-none">&gt;</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-purple-900/40 px-2 py-1 rounded focus:outline-none"
        />
      </form>
    </div>
  )
}
