import React, { useState } from 'react'

export function UnsubscribePage() {
  const params = new URLSearchParams(window.location.search)
  const initialEmail = params.get('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const notFoundMsg =
    "It seems you're starting to become even more inside a dream, as it looks like you're imagining an email that is not correctly within the ZenzaLife OS."

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch('/functions/v1/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.status === 404) {
        setError(notFoundMsg)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Request failed')
        return
      }

      setDone(true)
    } catch (err) {
      console.error('unsubscribe', err)
      setError('Request failed')
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="space-y-6 text-center p-8 card-floating max-w-md mx-auto">
          <h1 className="text-3xl font-light text-gray-800">You are unsubscribed</h1>
          <p className="text-gray-600 font-light">You will no longer receive updates from Zenza Scheduler.</p>
          <p className="text-gray-600 font-light">
            Changed your mind? Visit the home page and sign in again to re-subscribe for updates,
            changelogs, family news and future milestones.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-6 text-center p-8 card-floating max-w-md mx-auto">
        <h1 className="text-3xl font-light text-gray-800">Unsubscribe</h1>
        <p className="text-gray-600 font-light">
          {import.meta.env.VITE_UNSUBSCRIBE_WARNING_TEXT || 'Enter your email address to stop receiving messages.'}
        </p>
        <input
          type="email"
          required
          className="input-dreamy w-full"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-dreamy-primary w-full">Unsubscribe</button>
      </form>
    </div>
  )
}
