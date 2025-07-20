import { useCallback } from 'react'

export function useNotifications() {
  const requestPermission = useCallback(async () => {
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch (err) {
        console.error('Notification permission request failed', err)
      }
    }
  }, [])

  const scheduleNotification = useCallback(
    (title: string, options: NotificationOptions, delayMs: number) => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'schedule-notification',
          payload: { title, options, delay: delayMs }
        })
      }
    },
    []
  )

  const testAlarm = useCallback(() => {
    scheduleNotification('Test Alarm', { body: 'This is a test alarm.' }, 5000)
  }, [scheduleNotification])

  return { requestPermission, scheduleNotification, testAlarm }
}
