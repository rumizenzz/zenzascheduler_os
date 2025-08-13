import React, { useState } from 'react'
import { X } from 'lucide-react'

interface NumberTheoryToolProps {
  onClose: () => void
}

function primeFactors(n: number): number[] {
  const factors: number[] = []
  let num = n
  for (let i = 2; i * i <= num; i++) {
    while (num % i === 0) {
      factors.push(i)
      num = num / i
    }
  }
  if (num > 1) factors.push(num)
  return factors
}

function formatFactors(factors: number[]): string {
  return factors.join(' × ')
}

function gcd(a: number, b: number): number {
  let x = a
  let y = b
  while (y !== 0) {
    ;[x, y] = [y, x % y]
  }
  return Math.abs(x)
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

export function NumberTheoryTool({ onClose }: NumberTheoryToolProps) {
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState<string[]>([])
  const [gcdValue, setGcdValue] = useState<number | null>(null)
  const [lcmValue, setLcmValue] = useState<number | null>(null)

  const handleAnalyze = () => {
    const nums = input
      .split(/[,\s]+/)
      .map((n) => parseInt(n))
      .filter((n) => !isNaN(n) && n > 0)

    if (nums.length === 0) {
      setAnalysis([])
      setGcdValue(null)
      setLcmValue(null)
      return
    }

    const lines: string[] = []
    nums.forEach((n) => {
      const factors = primeFactors(n)
      lines.push(`Prime factorization of ${n}: ${formatFactors(factors)}`)
      lines.push(`${n} is ${factors.length === 1 && factors[0] === n ? 'Prime' : 'Composite'}`)
    })

    if (nums.length > 1) {
      const g = nums.reduce((a, b) => gcd(a, b))
      const l = nums.reduce((a, b) => lcm(a, b))
      setGcdValue(g)
      setLcmValue(l)
    } else {
      setGcdValue(null)
      setLcmValue(null)
    }

    setAnalysis(lines)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-full max-w-md space-y-4 text-purple-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-light">Number Theory Tool</h2>
          <button onClick={onClose} className="btn-dreamy p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-purple-700 text-purple-100 text-sm"
          placeholder="Enter numbers separated by space or comma"
        />
        <button onClick={handleAnalyze} className="btn-dreamy-primary w-full text-sm">
          Analyze
        </button>
        {analysis.length > 0 && (
          <div className="space-y-1 text-sm">
            {analysis.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            {gcdValue !== null && lcmValue !== null && (
              <div className="pt-2 space-y-1">
                <div>GCD: {gcdValue}</div>
                <div>LCM: {lcmValue}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

