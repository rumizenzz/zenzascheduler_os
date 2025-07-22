import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface FamilyConstellationProps {
  onClose: () => void
}

interface Star {
  x: number
  y: number
  phase: number
}

interface ShootingStar {
  x: number
  y: number
  dx: number
  dy: number
  life: number
}

export function FamilyConstellation({ onClose }: FamilyConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shootingStars = useRef<ShootingStar[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const bgStars: Star[] = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      phase: Math.random() * Math.PI * 2
    }))

    const figureSizes = [40, 40, 30, 30]
    const spacing = 120
    const speed = 20
    const startTime = performance.now()
    let shimmerUntil = 0

    const drawFigure = (
      baseX: number,
      baseY: number,
      size: number,
      phase: number,
      brightness: number
    ) => {
      const head = { x: baseX, y: baseY - size * 1.3 }
      const torso = { x: baseX, y: baseY }
      const leftHand = {
        x: baseX - size,
        y: baseY - size * 0.2 + Math.sin(phase) * (size * 0.3)
      }
      const rightHand = {
        x: baseX + size,
        y: baseY - size * 0.2 + Math.sin(phase + Math.PI) * (size * 0.3)
      }
      const leftFoot = {
        x: baseX - size * 0.5,
        y: baseY + size + Math.sin(phase + Math.PI) * (size * 0.5)
      }
      const rightFoot = {
        x: baseX + size * 0.5,
        y: baseY + size + Math.sin(phase) * (size * 0.5)
      }
      const points = [head, torso, leftHand, rightHand, leftFoot, rightFoot]

      ctx.strokeStyle = `rgba(255,255,255,${0.7 * brightness})`
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 8
      ctx.shadowColor = `rgba(255,255,255,${0.8 * brightness})`

      ctx.beginPath()
      ctx.moveTo(head.x, head.y)
      ctx.lineTo(torso.x, torso.y)
      ctx.lineTo(leftFoot.x, leftFoot.y)
      ctx.moveTo(torso.x, torso.y)
      ctx.lineTo(rightFoot.x, rightFoot.y)
      ctx.moveTo(torso.x, torso.y)
      ctx.lineTo(leftHand.x, leftHand.y)
      ctx.moveTo(torso.x, torso.y)
      ctx.lineTo(rightHand.x, rightHand.y)
      ctx.stroke()

      ctx.shadowBlur = 0
      for (const p of points) {
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${brightness})`
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      return { leftHand, rightHand }
    }

    const animate = () => {
      const t = (performance.now() - startTime) / 1000
      ctx.fillStyle = '#000b28'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const star of bgStars) {
        const alpha = 0.5 + 0.5 * Math.sin(t * 2 + star.phase)
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.arc(star.x * canvas.width, star.y * canvas.height, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      const offsetX =
        ((t * speed) % (canvas.width + spacing * figureSizes.length)) -
        spacing
      const hands: Array<{ left: { x: number; y: number }; right: { x: number; y: number } }> = []
      for (let i = 0; i < figureSizes.length; i++) {
        const baseX = offsetX + i * spacing
        const phase = t * 2 + i
        const brightness = t < shimmerUntil ? 1.5 : 1
        const { leftHand, rightHand } = drawFigure(
          baseX,
          canvas.height * 0.6,
          figureSizes[i],
          phase,
          brightness
        )
        hands.push({ left: leftHand, right: rightHand })
      }

      ctx.strokeStyle = `rgba(255,255,255,${
        0.7 * (t < shimmerUntil ? 1.5 : 1)
      })`
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(255,255,255,0.8)'
      for (let i = 0; i < hands.length - 1; i++) {
        ctx.beginPath()
        ctx.moveTo(hands[i].right.x, hands[i].right.y)
        ctx.lineTo(hands[i + 1].left.x, hands[i + 1].left.y)
        ctx.stroke()
      }
      ctx.shadowBlur = 0

      for (const s of shootingStars.current) {
        ctx.beginPath()
        ctx.fillStyle = 'white'
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2)
        ctx.fill()
        s.x += s.dx
        s.y += s.dy
        s.life -= 0.02
      }
      shootingStars.current = shootingStars.current.filter((s) => s.life > 0)

      requestAnimationFrame(animate)
    }
    animate()

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      shootingStars.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        dx: (Math.random() - 0.5) * 10,
        dy: -4 - Math.random() * 4,
        life: 1
      })
      shimmerUntil = (performance.now() - startTime) / 1000 + 1
    }
    canvas.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-white" />
      </button>
    </div>
  )
}

