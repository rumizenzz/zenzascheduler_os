import React, { useEffect, useRef, useState } from 'react'
import Tesseract from 'tesseract.js'
import { BlockMath } from 'react-katex'
import { X } from 'lucide-react'

interface ScreenshotPasteModalProps {
  onClose: () => void
  onInsert: (expr: string) => void
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export function ScreenshotPasteModal({ onClose, onInsert }: ScreenshotPasteModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [lines, setLines] = useState<string[]>([])
  const [selection, setSelection] = useState<Rect | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image')) {
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = () => setImageSrc(reader.result as string)
            reader.readAsDataURL(file)
          }
        }
      }
    }
    const node = containerRef.current
    node?.addEventListener('paste', handlePaste)
    return () => node?.removeEventListener('paste', handlePaste)
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    startRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setSelection(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!startRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setSelection({
      x: Math.min(x, startRef.current.x),
      y: Math.min(y, startRef.current.y),
      w: Math.abs(x - startRef.current.x),
      h: Math.abs(y - startRef.current.y)
    })
  }

  const handleMouseUp = () => {
    startRef.current = null
  }

  const parseMath = (line: string) => {
    const cleaned = line
      .replace(/[^0-9+\-*/().^xX\s/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!/[0-9]/.test(cleaned) || !/[+\-*/xX/]/.test(cleaned)) return null
    return {
      expr: cleaned
        .replace(/[xX]/g, '*')
        .replace(/(\d+)\s+(\d+)\s*\/\s*(\d+)/g, '($1+$2/$3)'),
      display: cleaned
        .replace(/[xX]/g, '\\times')
        .replace(/(\d+)\s+(\d+)\s*\/\s*(\d+)/g, '$1\\frac{$2}{$3}')
    }
  }

  const handleExtract = async () => {
    if (!imageSrc) return
    let src = imageSrc
    if (selection && imgRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = selection.w
      canvas.height = selection.h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(
        imgRef.current,
        selection.x,
        selection.y,
        selection.w,
        selection.h,
        0,
        0,
        selection.w,
        selection.h
      )
      src = canvas.toDataURL('image/png')
    }
    const { data } = await Tesseract.recognize(src, 'eng')
    setLines(data.text.trim().split('\n'))
  }

  const handleLineClick = (line: string) => {
    const math = parseMath(line)
    onInsert((math ? math.expr : line).trim())
    onClose()
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div className="harold-sky bg-purple-950 border-2 border-purple-400 rounded-lg p-4 max-w-2xl w-full space-y-3 text-purple-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-light">Paste Screenshot</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-purple-800"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="border border-dashed border-purple-400 p-2 text-center min-h-[150px] flex items-center justify-center">
          {imageSrc ? (
            <div className="relative">
              <img
                src={imageSrc}
                ref={imgRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                draggable={false}
                className="max-h-64 select-none cursor-crosshair"
                alt="pasted screenshot"
              />
              {selection && (
                <div
                  className="absolute border-2 border-red-400"
                  style={{
                    left: selection.x,
                    top: selection.y,
                    width: selection.w,
                    height: selection.h
                  }}
                />
              )}
            </div>
          ) : (
            <span>Click here and press Ctrl+V to paste</span>
          )}
        </div>
        {imageSrc && (
          <button
            onClick={handleExtract}
            className="btn-dreamy-primary w-full text-sm"
          >
            Extract Text
          </button>
        )}
        {lines.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {lines.map((line, i) => {
              const math = parseMath(line)
              return (
                <div
                  key={i}
                  onClick={() => handleLineClick(line)}
                  className="p-1 hover:bg-purple-900 rounded cursor-pointer"
                >
                  {math ? (
                    <BlockMath math={math.display} />
                  ) : (
                    <span>{line}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScreenshotPasteModal
