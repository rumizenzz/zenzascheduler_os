import React, { useState } from 'react'
import { X } from 'lucide-react'

interface FactorTreeProps {
  onClose: () => void
}

interface FactorNode {
  value: number
  left?: FactorNode
  right?: FactorNode
}

function buildFactorTree(n: number): FactorNode {
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      return {
        value: n,
        left: buildFactorTree(i),
        right: buildFactorTree(n / i)
      }
    }
  }
  return { value: n }
}

function primeFactors(n: number): number[] {
  const factors: number[] = []
  while (n % 2 === 0) {
    factors.push(2)
    n /= 2
  }
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    while (n % i === 0) {
      factors.push(i)
      n /= i
    }
  }
  if (n > 1) factors.push(n)
  return factors
}

const NodeView: React.FC<{ node: FactorNode }> = ({ node }) => (
  <div className="flex flex-col items-center">
    <div className="py-1 px-2 border border-purple-700 rounded">{node.value}</div>
    {node.left && node.right && (
      <div className="flex mt-2 space-x-4">
        <NodeView node={node.left} />
        <NodeView node={node.right} />
      </div>
    )}
  </div>
)

export function FactorTree({ onClose }: FactorTreeProps) {
  const [input, setInput] = useState('')
  const num = parseInt(input, 10)
  const tree = !isNaN(num) && num > 1 ? buildFactorTree(num) : null
  const primes = !isNaN(num) && num > 1 ? primeFactors(num) : []

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-full max-w-lg space-y-4 text-purple-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-light">Factor Tree</h2>
          <button onClick={onClose} className="btn-dreamy p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a positive integer"
          className="input-dreamy w-full text-sm"
        />
        {tree && (
          <div className="overflow-auto max-h-[60vh]">
            <NodeView node={tree} />
            <div className="mt-2 text-sm">
              Prime factors: {primes.join(' × ')}
            </div>
          </div>
        )}
        {!tree && input && <div className="text-sm text-red-300">Enter an integer greater than 1.</div>}
      </div>
    </div>
  )
}

