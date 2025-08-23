import React from 'react'
import { X } from 'lucide-react'

interface GEDCalculatorProps {
  onClose: () => void
}

export function GEDCalculator({ onClose }: GEDCalculatorProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg w-[22rem] h-[32rem] flex flex-col">
        <div className="flex justify-between items-center p-2">
          <h2 className="text-lg font-light text-purple-100">GED Calculator</h2>
          <button onClick={onClose} className="btn-dreamy p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <iframe
          src="https://www.desmos.com/calculator/ti30xsmv?embed"
          title="TI-30XS Calculator"
          className="flex-1 w-full rounded-b-lg border-0"
        />
      </div>
    </div>
  )
}

