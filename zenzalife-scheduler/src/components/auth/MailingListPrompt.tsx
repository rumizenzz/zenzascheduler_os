import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

// Displays a prompt asking the user to subscribe to updates after signing in
export function MailingListPrompt() {
  const { user } = useAuth()
  const [status, setStatus] = useState<'checking' | 'subscribed' | 'not-subscribed' | 'error' | 'dismissed'>('checking')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (!user?.email) return
      try {
        const { data } = await supabase
          .from('mailing_list')
          .select('unsubscribed')
          .eq('email', user.email)
          .maybeSingle()
        if (!data) {
          setStatus('not-subscribed')
        } else if (!data.unsubscribed) {
          setStatus('subscribed')
        } else {
          setStatus('not-subscribed')
        }
      } catch (e) {
        console.error('Mailing list check failed', e)
        setStatus('error')
      }
    }
    check()
  }, [user])

  if (status === 'checking' || status === 'dismissed' || !user) return null

  const subscribe = async () => {
    if (!user.email) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('mailing_list')
        .upsert({ email: user.email, unsubscribed: false }, { onConflict: 'email' })
      if (error) throw error
      toast.success('Subscribed for updates!')
      setStatus('subscribed')
    } catch (e: any) {
      console.error('Subscribe error', e)
      toast.error(e.message || 'Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  const close = () => setStatus('dismissed')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full space-y-4 text-center">
        {status === 'subscribed' ? (
          <>
            <h2 className="text-xl font-light text-gray-800">You're on the mailing list</h2>
            <p className="text-gray-600 font-light">
              You'll receive updates, changelogs and family news like new babies and milestones.
            </p>
            <button onClick={close} className="btn-dreamy-primary w-full">Close</button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-light text-gray-800">Receive Updates?</h2>
            <p className="text-gray-600 font-light">
              Would you like to get emails with changelogs, life updates and family milestones?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={subscribe}
                disabled={loading}
                className="btn-dreamy-primary flex-1"
              >
                {loading ? 'Subscribing...' : 'Yes, sign me up'}
              </button>
              <button onClick={close} className="btn-dreamy flex-1">No Thanks</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
