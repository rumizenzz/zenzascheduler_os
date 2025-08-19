import React, { useState, useEffect } from 'react'

interface Pad {
  label: string
  audio: string
}

const DEFAULT_PADS: Pad[] = Array.from({ length: 16 }, () => ({ label: '', audio: '' }))

export function SoundboardModule() {
  const [pads, setPads] = useState<Pad[]>(() => {
    const stored = localStorage.getItem('soundboardPads')
    return stored ? (JSON.parse(stored) as Pad[]) : DEFAULT_PADS
  })
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    localStorage.setItem('soundboardPads', JSON.stringify(pads))
  }, [pads])

  const handleFileChange = (index: number, file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setPads(prev => {
        const updated = [...prev]
        updated[index] = {
          label: file.name.replace(/\.[^/.]+$/, ''),
          audio: dataUrl
        }
        return updated
      })
    }
    reader.readAsDataURL(file)
  }

  const clearPad = (index: number) => {
    setPads(prev => {
      const updated = [...prev]
      updated[index] = { label: '', audio: '' }
      return updated
    })
  }

  const playPad = (index: number) => {
    const pad = pads[index]
    if (!pad.audio) return
    const audio = new Audio(pad.audio)
    audio.volume = volume
    void audio.play()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Soundboard</h2>
      <div className="flex items-center gap-2">
        <label htmlFor="volume" className="text-sm">
          Volume
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {pads.map((pad, i) => (
          <div
            key={i}
            className="bg-white/20 rounded-lg p-3 flex flex-col items-center justify-center"
          >
            {pad.audio ? (
              <>
                <button
                  onClick={() => playPad(i)}
                  className="w-full h-16 bg-purple-200 rounded mb-2 flex items-center justify-center text-sm font-medium"
                >
                  {pad.label || `Pad ${i + 1}`}
                </button>
                <div className="flex gap-2 text-xs">
                  <label className="text-blue-600 cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={e =>
                        handleFileChange(i, e.target.files?.[0])
                      }
                    />
                  </label>
                  <button
                    className="text-red-600"
                    onClick={() => clearPad(i)}
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <label className="w-full h-16 bg-purple-100 rounded flex items-center justify-center cursor-pointer text-sm font-medium">
                Upload
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={e =>
                    handleFileChange(i, e.target.files?.[0])
                  }
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SoundboardModule
