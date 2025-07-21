import React, { useEffect, useState } from 'react'
import { InstallGuide } from './InstallGuide'
import { AndroidBatteryGuide } from './AndroidBatteryGuide'
import { AndroidUnknownAppsGuide } from './AndroidUnknownAppsGuide'
import { IOSBackgroundGuide } from './IOSBackgroundGuide'
import { useNotifications } from '@/hooks/useNotifications'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useIsMobile } from '@/hooks/use-mobile'

export function OnboardingModal() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const { requestPermission, testAlarm } = useNotifications()
  const { installed, isIncognito } = useInstallPrompt()
  const isMobile = useIsMobile()

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
    !installed && {
      title: 'Install ZenzaLife Scheduler',
      content: <InstallGuide />
    },
    isAndroid && {
      title: 'Allow Unknown Apps',
      content: <AndroidUnknownAppsGuide />
    },
    {
      title: 'Enable Notifications',
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-700">
            Allow notifications so alarms and reminders can alert you.
          </p>
          {isIncognito && (
            <p className="text-sm text-red-600">
              Notifications cannot be enabled in incognito mode.
            </p>
          )}
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
        <div className="space-y-3">
          <p className="text-sm text-gray-700 text-center">
            For reliable alarms, enable <strong>Background App Refresh</strong> and{' '}
            <strong>Time Sensitive Notifications</strong> on iOS. On Android,
            allow ZenzaLife to run without battery optimization.
          </p>
          <div className="flex gap-4 justify-center">
            <AndroidBatteryGuide />
            <IOSBackgroundGuide />
          </div>
        </div>
      )
    },
    {
      title: 'Refresh the Dashboard',
      content: (
        <div className="space-y-3 text-center">
          <p className="text-sm text-gray-700">
            Swipe down anywhere to refresh the app if something looks outdated.
          </p>
        </div>
      )
    },
    {
      title: 'Reschedule Tasks',
      content: (
        <div className="space-y-3 text-center">
          <p className="text-sm text-gray-700">
            {isMobile
              ? 'Long press then drag a task to move it to a new time.'
              : 'Hold Shift and drag a task to move it to a new time.'}
          </p>
        </div>
      )
    }
  ].filter(Boolean) as { title: string; content: JSX.Element }[]

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
