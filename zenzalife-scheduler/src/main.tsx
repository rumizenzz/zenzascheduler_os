import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { ConfirmPage } from '@/components/auth/ConfirmPage'
import { UnsubscribePage } from '@/components/auth/UnsubscribePage'
import './globals.css'
aimport React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { ConfirmPage } from '@/components/auth/ConfirmPage'
import { UnsubscribePage } from '@/components/auth/UnsubscribePage'
import './globals.css'

const root = document.getElementById('root')!
const path = window.location.pathname

registerSW({ immediate: true })

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {path === '/confirmed' ? (
      <ConfirmPage />
    ) : path === '/unsubscribe' ? (
      <UnsubscribePage />
    ) : (
      <App />
    )}
  </React.StrictMode>,
)

const root = document.getElementById('root')!
const path = window.location.pathname

registerSW({ immediate: true })

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {path === '/confirmed' ? (
      <ConfirmPage />
    ) : path === '/unsubscribe' ? (
      <UnsubscribePage />
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
