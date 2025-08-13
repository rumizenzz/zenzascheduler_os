import React, { useState } from 'react'
import { X } from 'lucide-react'

interface FactorTreeProps {
  onClose: () => void
}

interface FactorNode {
  value: number
  children?: FactorNode[]
}

function factorize(n: number): FactorNode {
  if (n <= 1 || Number.isNaN(n) || !Number.isFinite(n)) {
    return { value: n }
  }
  for (let i = 2; i <= Math.floor(Math.sqrt(n)); i++) {
    if (n % i === 0) {
      return {
        value: n,
        children: [factorize(i), factorize(n / i)]
      }
    }
  }
  return { value: n }
}

function renderNode(node: FactorNode): JSX.Element {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1">{node.value}</div>
      {node.children && (
        <div className="flex space-x-4">
          {node.children.map((child, idx) => (
            <div key={idx}>{renderNode(child)}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export function FactorTree({ onClose }: FactorTreeProps) {
  const [input, setInput] = useState('')
  const [root, setRoot] = useState<FactorNode | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)
    const num = parseInt(val, 10)
    if (!Number.isNaN(num) && num > 0) {
      setRoot(factorize(num))
    } else {
      setRoot(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-full max-w-md space-y-4 text-purple-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-light">Factor Tree</h2>
          <button onClick={onClose} className="btn-dreamy p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          value={input}
          onChange={handleChange}
          className="input-dreamy w-full text-sm"
          placeholder="Enter a number"
        />
        <div className="overflow-auto max-h-[60vh] text-center">
          {root ? (
            renderNode(root)
          ) : (
            <p className="text-sm">Enter a positive integer.</p>
          )}
        </div>
      </div>
    </div>
  )
}

