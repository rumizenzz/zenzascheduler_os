import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ConfirmPage } from '@/components/auth/ConfirmPage'
import { UnsubscribePage } from '@/components/auth/UnsubscribePage'
import './globals.css'

const root = document.getElementById('root')!
const path = window.location.pathname

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
