import React, { useEffect, useState } from 'react'

interface MeanState {
  sum: number
  mean: number
  count: number
  rect: DOMRect
}

export function SelectionMeanOverlay() {
  const [state, setState] = useState<MeanState | null>(null)

  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) {
        setState(null)
        return
      }
      const text = sel.toString().trim()
      if (!text || /[^0-9+.\s-]/.test(text)) {
        setState(null)
        return
      }
      const nums = text.match(/-?\d+(?:\.\d+)?/g)
      if (!nums || nums.length < 2) {
        setState(null)
        return
      }
      const values = nums.map((n) => parseFloat(n))
      const sum = values.reduce((a, b) => a + b, 0)
      const count = values.length
      const mean = sum / count
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      setState({ sum, mean, count, rect })
    }
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  if (!state) return null

  const style = {
    top: state.rect.bottom + window.scrollY + 8,
    left: state.rect.left + window.scrollX
  }

  return (
    <div
      style={style}
      className="fixed z-50 harold-sky bg-purple-950 border-2 border-purple-400 rounded p-2 text-sm text-white space-y-1"
    >
      <div>Sum: {state.sum}</div>
      <div>
        Mean (÷{state.count}): {Number.isFinite(state.mean) ? state.mean : ''}
      </div>
      <button
        className="btn-secondary mt-1 w-full text-xs"
        onClick={() => setState(null)}
      >
        Close
      </button>
    </div>
  )
}

export default SelectionMeanOverlay
