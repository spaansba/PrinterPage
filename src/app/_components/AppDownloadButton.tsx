import React, { useEffect, useState } from "react"
import { DownloadIcon } from "lucide-react"

// TypeScript interfaces for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

// Extend Window interface to include beforeinstallprompt event
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

const AppDownloadButton: React.FC = () => {
  const [showInstallButton, setShowInstallButton] = useState<boolean>(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent): void => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(!isStandalone)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Type the MediaQueryList event
    const handleDisplayModeChange = (e: MediaQueryListEvent): void => {
      setShowInstallButton(!e.matches)
    }

    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    mediaQuery.addEventListener("change", handleDisplayModeChange)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      mediaQuery.removeEventListener("change", handleDisplayModeChange)
    }
  }, [])

  const handleInstallClick = async (): Promise<void> => {
    if (!deferredPrompt) return

    try {
      // Show installation prompt
      await deferredPrompt.prompt()

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("App was installed")
        setShowInstallButton(false)
      } else {
        console.log("App installation was declined")
      }

      // Clear the deferredPrompt for next time
      setDeferredPrompt(null)
    } catch (error) {
      console.error("Error installing app:", error)
    }
  }

  if (!showInstallButton) return null

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      aria-label="Install App"
    >
      <DownloadIcon size={20} />
      <span>Install App</span>
    </button>
  )
}

export default AppDownloadButton
