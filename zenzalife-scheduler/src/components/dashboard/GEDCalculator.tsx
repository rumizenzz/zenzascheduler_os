import React from 'react'
import { X } from 'lucide-react'

interface GEDCalculatorProps {
  onClose: () => void
}

export function GEDCalculator({ onClose }: GEDCalculatorProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 w-[400px] h-[640px] flex flex-col text-purple-100">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-light">GED Calculator</h2>
          <button onClick={onClose} className="btn-dreamy p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <iframe
          src="https://gedcalculator.ti.com/"
          title="TI-30XS MultiView"
          className="flex-1 rounded bg-white"
        />
      </div>
    </div>
  )
}

