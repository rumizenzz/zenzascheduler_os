import React from 'react'
import { X } from 'lucide-react'

interface MultiplicationTableProps {
  onClose: () => void
}

export function MultiplicationTable({ onClose }: MultiplicationTableProps) {
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1)
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-full max-w-lg space-y-2 text-purple-100">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-light">Multiplication Table</h2>
          <button onClick={onClose} className="btn-dreamy p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-auto max-h-[60vh]">
          <table className="border-collapse w-full text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="p-1 border border-purple-700"></th>
                {numbers.map((n) => (
                  <th key={n} className="p-1 border border-purple-700 text-center">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numbers.map((row) => (
                <tr key={row}>
                  <th className="p-1 border border-purple-700 text-center bg-purple-900">
                    {row}
                  </th>
                  {numbers.map((col) => (
                    <td key={col} className="p-1 border border-purple-700 text-center">
                      {row * col}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

