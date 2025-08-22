import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // Hook for error reporting provider (e.g., Sentry)
    // console.error('App ErrorBoundary', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
          <div className="text-center space-y-3">
            <div className="text-2xl font-light text-gray-700">Something went wrong</div>
            <div className="text-gray-600">Please refresh the page to continue.</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
