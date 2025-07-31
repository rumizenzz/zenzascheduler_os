import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export function useInstallPrompt() {
  const checkStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(checkStandalone())
  const [isStandalone, setIsStandalone] = useState(checkStandalone())
  const [isIncognito, setIsIncognito] = useState(false)

  useEffect(() => {
    const handleBefore = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      e.prompt()
      e.userChoice.finally(() => setDeferredPrompt(null))
    }
    window.addEventListener('beforeinstallprompt', handleBefore)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setIsStandalone(true)
    })
    const updateStandalone = () => setIsStandalone(checkStandalone())
    window.addEventListener('visibilitychange', updateStandalone)
    navigator.storage?.estimate?.().then(({ quota }) => {
      if (quota && quota < 120 * 1024 * 1024) setIsIncognito(true)
    })
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBefore)
      window.removeEventListener('visibilitychange', updateStandalone)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)
  const isDesktop = !isIOS && !isAndroid

  return {
    deferredPrompt,
    promptInstall,
    isIOS,
    isAndroid,
    isDesktop,
    installed,
    isStandalone,
    isIncognito
  }
}
