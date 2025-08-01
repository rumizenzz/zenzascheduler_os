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
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('mathSolverHistory')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        /* ignore malformed history */
      }
    }

    const loadFromSupabase = async () => {
      const user = await getCurrentUser()
      if (!user) return
      const { data, error } = await supabase
        .from('math_solver_history')
        .select('expression, result')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setHistory(data)
        localStorage.setItem('mathSolverHistory', JSON.stringify(data))
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

  const isMath = /^[0-9+\-*/().^\s]+$/.test(input)

  const handleSolve = async () => {
    try {
      const prepared = input.replace(/\^/g, '**')
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

  return (
    <div className="space-y-2">
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setResult(null)
        }}
        placeholder="Type a math expression"
        className="w-full p-2 border rounded"
      />
      {isMath && input && (
        <div className="space-y-2">
          <BlockMath math={input} />
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
        <div className="mt-4">
          <h3 className="font-semibold">Previous Problems</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {history.map((h, i) => (
              <li key={i} className="flex justify-between">
                <span>{h.expression}</span>
                <span className="text-gray-400">= {h.result}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

