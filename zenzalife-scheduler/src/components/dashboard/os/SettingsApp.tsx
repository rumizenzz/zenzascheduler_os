import React, { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface Props {
  content: string
  onChange: (content: string) => void
}

export function SettingsApp({ content, onChange }: Props) {
  const { user } = useAuth()
  const settings = useMemo(() => {
    try {
      return JSON.parse(content) as {
        darkMode: boolean
        wallpaper: string
      }
    } catch {
      return {
        darkMode: true,
        wallpaper:
          'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1920&q=80',
      }
    }
  }, [content])

  const toggleDark = () => {
    const next = { ...settings, darkMode: !settings.darkMode }
    void save(next)
  }

  const changeWallpaper = (wallpaper: string) => {
    const next = { ...settings, wallpaper }
    void save(next)
  }

  const save = async (next: { darkMode: boolean; wallpaper: string }) => {
    onChange(JSON.stringify(next))
    if (user) {
      await supabase
        .from('os_preferences')
        .upsert(
          {
            user_id: user.id,
            dark_mode: next.darkMode,
            wallpaper: next.wallpaper,
          },
          { onConflict: 'user_id' }
        )
    }
  }

  return (
    <div className="p-2 text-sm space-y-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.darkMode}
          onChange={toggleDark}
        />
        Dark mode (placeholder)
      </label>
      <div className="space-y-1">
        <label className="block">Wallpaper URL</label>
        <input
          type="text"
          value={settings.wallpaper}
          onChange={(e) => changeWallpaper(e.target.value)}
          className="w-full p-1 bg-purple-900/30 rounded"
        />
      </div>
    </div>
  )
}
