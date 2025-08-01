import React, { useState } from 'react'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

export function MathSolver() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const isMath = /^[0-9+\-*/().^\s]+$/.test(input)

  const handleSolve = () => {
    try {
      // eslint-disable-next-line no-new-func
      const value = Function(`return (${input})`)()
      setResult(String(value))
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
    </div>
  )
}

