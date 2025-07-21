import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const confirm = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setStatus('error')
          return
        }
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        await supabase
          .from('mailing_list')
          .update({ confirmed: true, confirmed_at: new Date().toISOString() })
          .eq('email', user.email)
      }
      setStatus('success')
    }
    confirm().catch(() => setStatus('error'))
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
        <p className="text-gray-600 font-light">Confirming your email...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
        <p className="text-red-500 font-light">Email confirmation failed.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
      <div className="space-y-6 text-center p-8 card-floating max-w-md mx-auto">
        <h1 className="text-3xl font-light text-gray-800">Email Confirmed</h1>
        <p className="text-gray-600 font-light">
          Thank you for confirming your email. Your ZenzaLife journey can now begin.
        </p>
        <p className="text-gray-500 text-sm font-light">
          You can close this page and return to the application.
        </p>
      </div>
    </div>
  )
}
