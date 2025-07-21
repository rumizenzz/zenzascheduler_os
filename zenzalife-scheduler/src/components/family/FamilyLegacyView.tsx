import React, { useEffect, useRef, useState } from 'react'
import { X, Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/hooks/useAudio'

interface FamilyLegacyViewProps {
  onClose: () => void
}

interface StarPoint {
  x: number
  y: number
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export function FamilyLegacyView({ onClose }: FamilyLegacyViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { playAudio, stopAudio, setMuted } = useAudio()
  const [muted, setMutedState] = useState(false)
  const [shimmerTime, setShimmerTime] = useState(0)
  const shootingStars = useRef<ShootingStar[]>([])

  useEffect(() => {
    playAudio('/audio/star-canopy.mp3', 0.6, true)
    return () => stopAudio()
  }, [playAudio, stopAudio])

  useEffect(() => {
    setMuted(muted)
  }, [muted, setMuted])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const bgStars = createBgStars(200)
    const start = performance.now()
    let animationId: number

    const animate = (time: number) => {
      const elapsed = (time - start) / 1000
      drawScene(ctx, canvas, bgStars, elapsed)
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [shimmerTime])

  const triggerShimmer = (e: React.MouseEvent) => {
    setShimmerTime(performance.now())
    // shooting star
    const sx = Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2
    shootingStars.current.push({
      x: sx,
      y: 0,
      vx: -300 - Math.random() * 100,
      vy: 300 + Math.random() * 100,
      life: 1
    })
  }

  const drawScene = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    bgStars: StarPoint[],
    elapsed: number
  ) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw background
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    bgStars.forEach((s, i) => {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(elapsed + i))
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.beginPath()
      ctx.arc(s.x * canvas.width, s.y * canvas.height, 1.2, 0, Math.PI * 2)
      ctx.fill()
    })

    const shimmerStrength = Math.max(
      0,
      1 - (performance.now() - shimmerTime) / 1000
    )

    drawFamily(ctx, canvas, elapsed, shimmerStrength)
    updateShootingStars(ctx, canvas)
  }

  const updateShootingStars = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    shootingStars.current = shootingStars.current.filter((s) => s.life > 0)
    shootingStars.current.forEach((s) => {
      s.x += s.vx * 0.016
      s.y += s.vy * 0.016
      s.life -= 0.02
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x - s.vx * 0.05, s.y - s.vy * 0.05)
      ctx.stroke()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={triggerShimmer}
      role="button"
      tabIndex={0}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <button
        onClick={(e) => {
          e.stopPropagation()
          setMutedState(!muted)
        }}
        className="absolute top-4 right-14 p-2 bg-black/50 rounded-full text-white"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

function createBgStars(count: number): StarPoint[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random()
  }))
}

const baseFigure: StarPoint[] = [
  { x: 0, y: -10 }, // head
  { x: 0, y: 0 }, // neck
  { x: 0, y: 30 }, // body
  { x: -10, y: 40 }, // left hip
  { x: -10, y: 70 }, // left knee
  { x: -10, y: 100 }, // left foot
  { x: 10, y: 40 }, // right hip
  { x: 10, y: 70 }, // right knee
  { x: 10, y: 100 }, // right foot
  { x: -20, y: 10 }, // left shoulder
  { x: -30, y: 20 }, // left hand
  { x: 20, y: 10 }, // right shoulder
  { x: 30, y: 20 } // right hand
]

const segments = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [2, 6],
  [6, 7],
  [7, 8],
  [1, 9],
  [9, 10],
  [1, 11],
  [11, 12]
]

function drawFigure(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  scale: number,
  time: number,
  shimmer: number
) {
  const points = baseFigure.map((p, i) => {
    let { x, y } = p
    // simple limb movement
    if (i === 4 || i === 7) {
      x += Math.sin(time * 2 + i) * 5
    }
    if (i === 10 || i === 12) {
      y += Math.sin(time * 2 + i) * 5
    }
    return { x: originX + x * scale, y: originY + y * scale }
  })

  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 2
  segments.forEach(([a, b]) => {
    ctx.beginPath()
    ctx.moveTo(points[a].x, points[a].y)
    ctx.lineTo(points[b].x, points[b].y)
    ctx.stroke()
  })

  points.forEach((pt) => {
    ctx.fillStyle = `rgba(255,255,255,${0.8 + shimmer})`
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawFamily(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  time: number,
  shimmer: number
) {
  const groupWidth = 260
  const progress = ((time * 20) % (canvas.width + groupWidth)) - groupWidth
  const startY = canvas.height * 0.6

  // parents
  drawFigure(ctx, progress, startY, 1, time, shimmer)
  drawFigure(ctx, progress + 60, startY, 1, time + 1, shimmer)

  // children
  drawFigure(ctx, progress + 140, startY + 20, 0.7, time + 2, shimmer)
  drawFigure(ctx, progress + 190, startY + 20, 0.7, time + 3, shimmer)
}

