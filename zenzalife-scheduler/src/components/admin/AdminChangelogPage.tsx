import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AdminChangelogPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [version, setVersion] = useState('')
  const [tags, setTags] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [secretInput, setSecretInput] = useState('')
  const [hasAccess, setHasAccess] = useState(
    typeof window !== 'undefined' && localStorage.getItem('changelogAccess') === 'true'
  )

  const checkCode = () => {
    if (secretInput === 'ZENZALIFE') {
      setHasAccess(true)
      localStorage.setItem('changelogAccess', 'true')
    } else {
      alert('Incorrect code')
    }
  }

  const submit = async () => {
    await supabase.from('change_log').insert({
      title,
      message,
      version,
      tags: tags.split(',').map((t) => t.trim()),
      icon_url: iconUrl,
      author: 'admin'
    })
    setTitle('')
    setMessage('')
    setVersion('')
    setTags('')
    setIconUrl('')
  }

  if (!hasAccess) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-medium">Changelog Admin</h1>
        <p>Enter the secret code to continue</p>
        <input
          className="border p-1 w-full"
          value={secretInput}
          onChange={(e) => setSecretInput(e.target.value)}
        />
        <button className="btn-dreamy-primary" onClick={checkCode}>
          Submit
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-medium">Changelog Admin</h1>
      <input
        className="border p-1 w-full"
        placeholder="Version"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
      />
      <input
        className="border p-1 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-1 w-full"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <input
        className="border p-1 w-full"
        placeholder="Tags comma separated"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <input
        className="border p-1 w-full"
        placeholder="Icon URL"
        value={iconUrl}
        onChange={(e) => setIconUrl(e.target.value)}
      />
      <button className="btn-dreamy-primary" onClick={submit}>Save</button>
    </div>
  )
}
