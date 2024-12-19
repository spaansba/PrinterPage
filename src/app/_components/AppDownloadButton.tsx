import React, { useEffect, useState } from "react"
import { Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const AppDownloadButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [appInstalled, setAppInstalled] = useState(true)
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setAppInstalled(!window.matchMedia("(display-mode: standalone)").matches)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  function handleInstallClick() {
    if (!deferredPrompt) {
      return
    }
    deferredPrompt.prompt()
  }
  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Download className="w-5 h-5" />
      <span>Install App</span>
    </button>
  )
}

export default AppDownloadButton
