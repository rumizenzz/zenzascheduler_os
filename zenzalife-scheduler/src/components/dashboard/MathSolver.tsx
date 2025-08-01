import React, { useEffect, useState } from 'react'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface MathSolverProps {
  expression?: string | null
}

export function MathSolver({ expression }: MathSolverProps) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  interface HistoryEntry {
    id?: number
    expression: string
    result: string
  }

  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const isDesktop =
    typeof navigator !== 'undefined' && !/Mobi|Android/i.test(navigator.userAgent)

  useEffect(() => {
    const loadFromSupabase = async () => {
      const user = await getCurrentUser()
      if (!user) return
      const { data, error } = await supabase
        .from('math_solver_history')
        .select('id, expression, result')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setHistory(data)
      }
    }

    loadFromSupabase()
  }, [])

  useEffect(() => {
    if (expression) {
      setInput(expression)
      setResult(null)
    }
  }, [expression])

  const isMath = /^[0-9+\-*/xX().^\s]+$/.test(input)

  const handleSolve = async () => {
    try {
      const prepared = input.replace(/\^/g, '**').replace(/[xX]/g, '*')
      // eslint-disable-next-line no-new-func
      const value = Function(`return (${prepared})`)()
      const stringValue = String(value)
      setResult(stringValue)
      const user = await getCurrentUser()
      const entry: HistoryEntry = { expression: input, result: stringValue }
      if (user) {
        const { data } = await supabase
          .from('math_solver_history')
          .insert({
            user_id: user.id,
            expression: input,
            result: stringValue
          })
          .select('id')
          .single()
        if (data?.id) entry.id = data.id
      }
      const newHistory = [entry, ...history]
      setHistory(newHistory)
    } catch {
      setResult('Error')
    }
  }

  const handleDelete = async (index: number, id?: number) => {
    const user = await getCurrentUser()
    if (user && id) {
      await supabase
        .from('math_solver_history')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    }
    const newHistory = history.filter((_, i) => i !== index)
    setHistory(newHistory)
  }

  const handleClear = async () => {
    const user = await getCurrentUser()
    if (user) {
      await supabase
        .from('math_solver_history')
        .delete()
        .eq('user_id', user.id)
    }
    setHistory([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDesktop && e.key === 'Enter' && isMath && input) {
      e.preventDefault()
      void handleSolve()
    }
  }

  return (
    <div className="space-y-2">
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setResult(null)
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a math expression"
        className="w-full p-2 border rounded"
      />
      {isMath && input && (
        <div className="space-y-2">
          <BlockMath math={input.replace(/[xX*]/g, '\\times')} />
          <button
            onClick={handleSolve}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Solve
          </button>
        </div>
      )}
      {result !== null && <div className="mt-2">Result: {result}</div>}
      {history.length > 0 && (
        <button
          onClick={() => setShowHistory(true)}
          className="btn-dreamy mt-2 text-sm"
        >
          History
        </button>
      )}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-6 max-w-sm w-full space-y-4 text-purple-100">
            <h2 className="text-lg font-light text-center">Previous Problems</h2>
            <ul className="mt-2 space-y-1 text-sm max-h-60 overflow-y-auto">
              {history.map((h, i) => (
                <li key={h.id ?? i} className="flex justify-between items-center gap-2">
                  <span>
                    {h.expression} <span className="text-gray-400">= {h.result}</span>
                  </span>
                  <button
                    onClick={() => handleDelete(i, h.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <button
                onClick={handleClear}
                className="btn-dreamy-secondary w-full text-sm"
              >
                Clear History
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="btn-dreamy-primary w-full text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

