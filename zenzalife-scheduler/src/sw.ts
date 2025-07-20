/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

self.addEventListener('message', event => {
  const data = event.data
  if (data?.type === 'schedule-notification') {
    const { title, options, delay } = data.payload
    setTimeout(() => {
      self.registration.showNotification(title, options)
    }, delay)
  }
})
