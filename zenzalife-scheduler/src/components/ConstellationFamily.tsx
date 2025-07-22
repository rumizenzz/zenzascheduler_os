import React from 'react'
import { Sparkles } from 'lucide-react'

interface Star {
  left: string
  top: string
  size: number
}

const stars: Star[] = [
  // parent left
  { left: '42%', top: '45%', size: 10 },
  { left: '40%', top: '55%', size: 8 },
  { left: '44%', top: '55%', size: 8 },
  { left: '42%', top: '65%', size: 8 },
  // parent right
  { left: '58%', top: '45%', size: 10 },
  { left: '56%', top: '55%', size: 8 },
  { left: '60%', top: '55%', size: 8 },
  { left: '58%', top: '65%', size: 8 },
  // child center
  { left: '50%', top: '60%', size: 6 },
  { left: '48%', top: '70%', size: 6 },
  { left: '52%', top: '70%', size: 6 },
]

export function ConstellationFamily() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s, i) => (
        <Sparkles
          key={i}
          className="absolute text-yellow-300/80 drop-shadow"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
        />
      ))}
    </div>
  )
}
