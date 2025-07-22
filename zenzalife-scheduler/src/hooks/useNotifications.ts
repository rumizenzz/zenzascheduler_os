import { useCallback } from 'react'

export function useNotifications() {
  const requestPermission = useCallback(async () => {
    try {
      await Notification.requestPermission()
    } catch (err) {
      console.error('Notification permission request failed', err)
    }
  }, [])

  const scheduleNotification = useCallback(
    async (title: string, options: NotificationOptions, delayMs: number) => {
      try {
        const reg = await navigator.serviceWorker.ready
        reg.active?.postMessage({
          type: 'schedule-notification',
          payload: {
            title,
            options: {
              ...options,
              requireInteraction: true,
              interruptionLevel: 'time-sensitive' as any
            },
            delay: delayMs
          }
        })
      } catch (err) {
        console.error('Failed to schedule notification', err)
      }
    },
    []
  )

  const scheduleNotificationAt = useCallback(
    async (title: string, options: NotificationOptions, time: number) => {
      const delay = time - Date.now()
      if (delay <= 0) {
        scheduleNotification(title, options, 0)
      } else {
        scheduleNotification(title, options, delay)
      }
    },
    [scheduleNotification]
  )

  const testAlarm = useCallback(() => {
    scheduleNotification(
      'Test Alarm',
      { body: 'This is a test alarm.' },
      5000
    )
  }, [scheduleNotification])

  return { requestPermission, scheduleNotification, scheduleNotificationAt, testAlarm }
}
