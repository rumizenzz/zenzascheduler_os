import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { DreamlikeEntrance } from '@/components/DreamlikeEntrance'
import { AuthForm } from '@/components/auth/AuthForm'
import { Dashboard } from '@/components/dashboard/Dashboard'
import './globals.css'

// Create a client
const queryClient = new QueryClient()

function AppContent() {
  const { user, loading } = useAuth()
  const [showEntrance, setShowEntrance] = useState(true)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-gray-600 font-light">Loading ZenzaLife...</p>
        </div>
      </div>
    )
  }

  // Show authentication if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6">
          <AuthForm mode={authMode} onModeChange={setAuthMode} />
        </div>
      </div>
    )
  }

  // Show dreamlike entrance experience first
  if (showEntrance) {
    return (
      <DreamlikeEntrance onComplete={() => setShowEntrance(false)}>
        <Dashboard />
      </DreamlikeEntrance>
    )
  }

  // Show main dashboard
  return <Dashboard />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: '#374151',
              fontSize: '14px',
              padding: '12px 16px'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff'
              }
            }
          }}
        />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App