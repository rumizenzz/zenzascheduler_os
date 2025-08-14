import React, { useMemo } from 'react'

interface Props {
  content: string
  onChange: (content: string) => void
}

export function SettingsApp({ content, onChange }: Props) {
  const settings = useMemo(() => {
    try {
      return JSON.parse(content) as { darkMode: boolean }
    } catch {
      return { darkMode: true }
    }
  }, [content])

  const toggleDark = () => {
    const next = { ...settings, darkMode: !settings.darkMode }
    onChange(JSON.stringify(next))
  }

  return (
    <div className="p-2 text-sm space-y-2">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.darkMode}
          onChange={toggleDark}
        />
        Dark mode (placeholder)
      </label>
    </div>
  )
}
