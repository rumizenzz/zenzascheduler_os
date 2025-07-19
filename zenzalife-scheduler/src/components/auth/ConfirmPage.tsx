import React from 'react'

export function ConfirmPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex items-center justify-center">
      <div className="space-y-6 text-center p-8 card-floating max-w-md mx-auto">
        <h1 className="text-3xl font-light text-gray-800">Email Confirmed</h1>
        <p className="text-gray-600 font-light">
          Thank you for confirming your email. Your ZenzaLife journey can now begin.
        </p>
        <p className="text-gray-500 text-sm font-light">
          You can close this page and return to the application.
        </p>
      </div>
    </div>
  )
}
