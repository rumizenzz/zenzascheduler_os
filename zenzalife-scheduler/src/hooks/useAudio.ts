import { useRef, useCallback } from 'react'

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playAudio = useCallback((audioUrl: string, volume: number = 0.3) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Create new audio instance
      audioRef.current = new Audio(audioUrl)
      audioRef.current.volume = volume
      
      // Play with user interaction handling
      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playing successfully')
          })
          .catch(error => {
            console.log('Audio play failed:', error)
            // This is expected if user hasn't interacted with the page yet
          })
      }
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }, [])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  const playEntranceSound = useCallback(() => {
    // Create a gentle chime sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create oscillator for soft chime
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Gentle bell-like frequency
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime) // E5
      oscillator.type = 'sine'
      
      // Soft volume with fade in/out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 2)
      
      // Add harmonic for richer sound
      const oscillator2 = audioContext.createOscillator()
      const gainNode2 = audioContext.createGain()
      
      oscillator2.connect(gainNode2)
      gainNode2.connect(audioContext.destination)
      
      oscillator2.frequency.setValueAtTime(987.77, audioContext.currentTime) // B5
      oscillator2.type = 'sine'
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode2.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.2)
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.8)
      
      oscillator2.start(audioContext.currentTime + 0.1)
      oscillator2.stop(audioContext.currentTime + 1.8)
      
    } catch (error) {
      console.log('Web Audio API not available, using fallback')
      // Fallback - you could use a simple beep or silence
    }
  }, [])

  return {
    playAudio,
    stopAudio,
    playEntranceSound
  }
}