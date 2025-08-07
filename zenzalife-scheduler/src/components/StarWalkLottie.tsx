import React, { useEffect, useRef, useState } from 'react'

// Lazy import without type dependency to avoid TS module resolution at build
let lottiePromise: Promise<any> | null = null
const loadLottie = async (): Promise<any | null> => {
  try {
    if (!lottiePromise) lottiePromise = import('lottie-web') as unknown as Promise<any>
    const mod: any = await lottiePromise
    return mod?.default ?? mod
  } catch {
    return null
  }
}

interface StarWalkLottieProps {
  className?: string
  path?: string // allow override
}

export function StarWalkLottie({ className, path = '/entrance/star-walk.json' }: StarWalkLottieProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [available, setAvailable] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true

    // Check if the JSON exists to avoid 404 flashes in production
    const checkAndLoad = async () => {
      try {
        const res = await fetch(path, { method: 'HEAD' })
        if (!isMounted) return
        if (!res.ok) {
          setAvailable(false)
          return
        }
        setAvailable(true)

        const lottie = await loadLottie()
        if (!lottie || !containerRef.current) return

        const anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          path,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
            progressiveLoad: true,
            hideOnTransparent: true,
          },
        })

        const handleResize = () => {
          // Resize-fast path (Lottie handles viewBox)
          anim.resize()
        }
        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
          anim.destroy()
        }
      } catch {
        if (isMounted) setAvailable(false)
      }
    }

    const cleanupPromise = checkAndLoad()

    return () => {
      isMounted = false
      // Cleanup handled inside checkAndLoad when promise resolves
      void cleanupPromise
    }
  }, [path])

  if (!available) return null

  return (
    <div
      className={className}
      aria-hidden
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  )
}


