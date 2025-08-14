import React, { useEffect, useState } from 'react'

interface BrowserAppProps {
  content: string
  onChange: (content: string) => void
}

export function BrowserApp({ content, onChange }: BrowserAppProps) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    try {
      const parsed = JSON.parse(content || '{}')
      setUrl(parsed.url || '')
    } catch {
      setUrl('')
    }
  }, [content])

  const navigate = () => {
    onChange(JSON.stringify({ url }))
  }

  const displayUrl = url.startsWith('http') ? url : url ? `https://${url}` : ''

  return (
    <div className="flex flex-col h-full">
      <div className="bg-purple-700 p-1 flex gap-2">
        <input
          className="flex-1 text-sm bg-purple-900/30 rounded px-2 focus:outline-none"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              navigate()
            }
          }}
          placeholder="Enter URL"
        />
        <button onClick={navigate} className="btn-dreamy-primary px-2 text-xs">
          Go
        </button>
      </div>
      {displayUrl && (
        <iframe src={displayUrl} className="flex-1 bg-white" title="browser" />
      )}
    </div>
  )
}

