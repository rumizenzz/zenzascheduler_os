import React, { useEffect, useState } from 'react'
import { InstallGuide } from './InstallGuide'
import { useNotifications } from '@/hooks/useNotifications'

export function OnboardingModal() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const { requestPermission, testAlarm } = useNotifications()

  useEffect(() => {
    if (localStorage.getItem('onboardingComplete')) return
    setShow(true)
  }, [])

  const finish = () => {
    localStorage.setItem('onboardingComplete', 'true')
    setShow(false)
  }

  if (!show) return null

  const steps = [
    {
      title: 'Install ZenzaLife Scheduler',
      content: <InstallGuide />
    },
    {
      title: 'Enable Notifications',
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-700">
            Allow notifications so alarms and reminders can alert you.
          </p>
          <button onClick={requestPermission} className="btn-dreamy-primary w-full text-sm">
            Enable Notifications
          </button>
          <button onClick={testAlarm} className="btn-dreamy w-full text-sm">
            Test Alarm
          </button>
        </div>
      )
    },
    {
      title: 'Platform Notes',
      content: (
        <p className="text-sm text-gray-700 text-center">
          iOS limits background alarms. Keep the app open for important alerts. Android can run persistent alarms when supported.
        </p>
      )
    }
  ]

  const stepData = steps[step]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full space-y-4">
        <h2 className="text-xl font-light text-gray-800 text-center">{stepData.title}</h2>
        {stepData.content}
        <div className="flex justify-between pt-4">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-dreamy text-sm">
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="btn-dreamy-primary text-sm">
              Next
            </button>
          ) : (
            <button onClick={finish} className="btn-dreamy-primary text-sm">
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
