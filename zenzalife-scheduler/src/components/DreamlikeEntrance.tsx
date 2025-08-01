import React, { useEffect, useState } from 'react'
import { useAudio } from '@/hooks/useAudio'
import { useAuth } from '@/contexts/AuthContext'
import { Cloud, Sparkles, X } from 'lucide-react'
import { ConstellationFamily } from './ConstellationFamily'

interface DreamlikeEntranceProps {
  onComplete: () => void
  children: React.ReactNode
}

export function DreamlikeEntrance({ onComplete, children }: DreamlikeEntranceProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [canSkip, setCanSkip] = useState(false)
  const [started, setStarted] = useState(false)
  const { playEntranceSound } = useAudio()
  const { profile } = useAuth()
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([])

  useEffect(() => {
    if (!started) return

    // Generate floating particles
    const particleArray = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }))
    setParticles(particleArray)

    // Play entrance sound if enabled
    if (profile?.entrance_sound_enabled !== false) {
      playEntranceSound()
    }

    // Allow skip after 3 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true)
    }, 3000)

    // Auto-complete after 6 seconds
    const autoCompleteTimer = setTimeout(() => {
      handleComplete()
    }, 6000)

    return () => {
      clearTimeout(skipTimer)
      clearTimeout(autoCompleteTimer)
    }
  }, [started, playEntranceSound, profile])

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
    }, 800) // Allow fade out animation to complete
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <button
          onClick={() => setStarted(true)}
          className="px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg font-semibold bg-white/70 backdrop-blur-md rounded-lg shadow-lg hover:bg-white transition"
        >
          Click to Enter ZenzaLife <span className="font-bold">OS</span> Scheduler
          <span className="block text-sm font-light">(Operating System of Life)</span>
        </button>
      </div>
    )
  }

  if (!isVisible) {
    return (
      <div className="transition-opacity duration-800 opacity-100">
        {children}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800 animate-pulse" />
      {/* Swirling overlay */}
      <div className="absolute inset-0 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-indigo-900 opacity-40 animate-slow-swirl" />
      
      {/* Animated Cloud Layers */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 opacity-30 animate-float-slow">
          <Cloud className="w-32 h-32 text-white/60" />
        </div>
        <div className="absolute top-20 right-20 opacity-20 animate-float-slower">
          <Cloud className="w-48 h-48 text-blue-200/40" />
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-25 animate-float-medium">
          <Cloud className="w-40 h-40 text-purple-200/50" />
        </div>
        <div className="absolute bottom-20 right-1/3 opacity-15 animate-float-slow">
          <Cloud className="w-56 h-56 text-white/30" />
        </div>
      </div>

      {/* Constellation Family */}
      <ConstellationFamily />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-float-particle opacity-40"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300/60" />
          </div>
        ))}
      </div>

      {/* Central Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in-up">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-light text-gray-800/80 tracking-wide animate-text-shimmer">
              ZenzaLife
            </h1>
            <p className="text-lg sm:text-xl text-gray-600/70 font-light tracking-wider">
              Scheduler
            </p>
          </div>
          
          {/* Subtitle */}
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500/80 font-light leading-relaxed animate-fade-in-delayed">
              Enter a higher dimension of life management
            </p>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center space-x-1 animate-fade-in-delayed-2">
            <div className="w-2 h-2 bg-blue-300/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-300/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-300/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      {/* Skip Button */}
      {canSkip && (
        <button
          onClick={handleComplete}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 animate-fade-in"
          aria-label="Skip entrance"
        >
          <X className="w-5 h-5 text-gray-600/70" />
        </button>
      )}

      {/* Bottom Message */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in-delayed-3">
        <p className="text-sm sm:text-base text-white font-light text-center drop-shadow">
          Made with ❤️ for my fiancée (soon to be wife) Khen Shantel Zappalorti.
          <br />Gihigugma tika sa tibuok nakong kasingkasing, baby ko.
        </p>
      </div>
    </div>
  )
}

// Custom animation styles for this component live in globals.css
