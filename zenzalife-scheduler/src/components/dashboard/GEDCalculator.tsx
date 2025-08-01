import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface GEDCalculatorProps {
  onClose: () => void
}

export function GEDCalculator({ onClose }: GEDCalculatorProps) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('mathSolverHistory')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        // ignore malformed history
      }
    }
  }, [])

  const handleButton = (value: string) => {
    if (value === 'C') {
      setInput('')
      setResult(null)
    } else if (value === 'DEL') {
      setInput((prev) => prev.slice(0, -1))
      setResult(null)
    } else if (value === '=') {
      handleSolve()
    } else if (value === '√') {
      setInput((prev) => prev + '√(')
    } else {
      setInput((prev) => prev + value)
    }
  }

  const handleSolve = async () => {
    try {
      const prepared = input
        .replace(/√/g, 'Math.sqrt')
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/\^/g, '**')
      // eslint-disable-next-line no-new-func
      const value = Function(`return (${prepared})`)()
      const stringValue = String(value)
      setResult(stringValue)
      const entry = { expression: input, result: stringValue }
      const newHistory = [entry, ...history]
      setHistory(newHistory)
      localStorage.setItem('mathSolverHistory', JSON.stringify(newHistory))
      const user = await getCurrentUser()
      if (user) {
        await supabase.from('math_solver_history').insert({
          user_id: user.id,
          expression: input,
          result: stringValue
        })
      }
    } catch {
      setResult('Error')
    }
  }

  const rows = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '^', '+'],
    ['(', ')', '√', '=']
  ]

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-80 space-y-2 text-purple-100">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-light">GED Calculator</h2>
          <button onClick={onClose} className="btn-dreamy p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-gray-800 rounded p-2 text-right font-mono text-xl overflow-x-auto">
          {input || '0'}
        </div>
        {result !== null && <div className="text-right">= {result}</div>}
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            {row.map((b) => (
              <button
                key={b}
                onClick={() => handleButton(b)}
                className="btn-dreamy h-10"
              >
                {b}
              </button>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => handleButton('C')} className="btn-dreamy h-10">
            C
          </button>
          <button onClick={() => handleButton('DEL')} className="btn-dreamy h-10">
            DEL
          </button>
          {history.length > 0 && (
            <button onClick={() => setShowHistory(true)} className="btn-dreamy h-10">
              History
            </button>
          )}
        </div>
        {showHistory && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-6 max-w-sm w-full space-y-4 text-purple-100">
              <h2 className="text-lg font-light text-center">Previous Problems</h2>
              <ul className="mt-2 space-y-1 text-sm max-h-60 overflow-y-auto">
                {history.map((h, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{h.expression}</span>
                    <span className="text-gray-400">= {h.result}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowHistory(false)}
                className="btn-dreamy-primary w-full text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

