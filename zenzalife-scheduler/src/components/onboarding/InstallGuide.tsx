import React from 'react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export function InstallGuide() {
  const { isIOS, isAndroid, isDesktop, deferredPrompt, promptInstall } = useInstallPrompt()

  return (
    <div className="p-4 bg-blue-50/80 rounded-xl space-y-3 text-center">
      <h3 className="font-medium text-blue-900">Download the App</h3>
      {isIOS ? (
        <div className="space-y-2 text-sm text-blue-700">
          <p>1. Tap the share icon in Safari</p>
          <p>2. Choose "Add to Home Screen"</p>
          <p>3. Open ZenzaLife from your home screen</p>
        </div>
      ) : deferredPrompt ? (
        <button onClick={promptInstall} className="btn-dreamy-primary text-sm">
          Install ZenzaLife
        </button>
      ) : (
        <p className="text-sm text-blue-700">
          Use your browser menu and choose "Add to Home Screen" to install.
        </p>
      )}
      {isDesktop && (
        <p className="text-xs text-blue-600">Desktop browsers show an install button in the address bar.</p>
      )}
    </div>
  )
}
