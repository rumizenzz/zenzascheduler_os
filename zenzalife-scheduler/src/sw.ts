/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any
}

precacheAndRoute(self.__WB_MANIFEST)

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
