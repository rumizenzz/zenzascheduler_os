import React, { useState } from 'react'

const BUTTONS = [
  ['7', '8', '9', '/', 'MC'],
  ['4', '5', '6', '*', 'MR'],
  ['1', '2', '3', '-', 'M+'],
  ['0', '.', '=', '+', 'M-'],
]

const FUNC_BUTTONS = ['sin', 'cos', 'tan', 'sqrt', '^', '(', ')', 'C']

function preprocess(expression: string): string {
  return expression
    .replace(/\^/g, '**')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/sqrt/g, 'Math.sqrt')
}

export function Ti30XsEmulator() {
  const [lines, setLines] = useState<string[]>(['', '', '', ''])
  const [current, setCurrent] = useState('')
  const [memory, setMemory] = useState(0)

  const pushLine = (text: string) => {
    setLines((prev) => {
      const next = [...prev]
      next.pop()
      next.unshift(text)
      return next
    })
  }

  const handleInput = (value: string) => {
    if (value === '=') {
      try {
        const result = Function(`return (${preprocess(current)})`)()
        pushLine(`${current} = ${result}`)
        setCurrent(String(result))
      } catch (e) {
        pushLine('Error')
        setCurrent('')
      }
      return
    }
    if (value === 'C') {
      setCurrent('')
      return
    }
    if (value === 'MC') {
      setMemory(0)
      return
    }
    if (value === 'MR') {
      setCurrent(String(memory))
      return
    }
    if (value === 'M+') {
      setMemory((m) => m + Number(current || '0'))
      return
    }
    if (value === 'M-') {
      setMemory((m) => m - Number(current || '0'))
      return
    }
    setCurrent((c) => c + value)
  }

  return (
    <div className="p-4 border rounded w-64 bg-gray-900 text-white">
      <div className="mb-2 h-20 font-mono flex flex-col justify-end items-end">
        {lines.map((line, idx) => (
          <div key={idx} className="leading-tight">
            {idx === 0 ? current || '0' : line}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1 mb-2">
        {BUTTONS.flat().map((b) => (
          <button
            key={b}
            onClick={() => handleInput(b)}
            className="py-2 bg-gray-700 rounded"
          >
            {b}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {FUNC_BUTTONS.map((b) => (
          <button
            key={b}
            onClick={() => handleInput(b)}
            className="py-2 bg-gray-700 rounded"
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Ti30XsEmulator
