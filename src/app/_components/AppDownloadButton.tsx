"use client"
import React, { useEffect, useState } from "react"
import { Download, Share, X, Plus } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const AppDownloadButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other")
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const iosSteps = [
    {
      title: "Tap the Share button",
      icon: <Share className="w-6 h-6" />,
      description: "First, tap the share icon in Safari's toolbar at the bottom of the screen",
      animation: "animate-pulse",
    },
    {
      title: "Find 'Add to Home Screen'",
      icon: <Plus className="w-6 h-6" />,
      description: "Scroll down in the share menu and tap 'Add to Home Screen'",
      animation: "animate-pulse",
    },
    {
      title: "Tap 'Add'",
      description: "Review the app name and tap 'Add' in the top right corner",
      animation: "animate-pulse",
    },
  ]

  useEffect(() => {
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      if (/ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream) {
        setPlatform("ios")
      } else if (/android/.test(userAgent)) {
        setPlatform("android")
      } else {
        setPlatform("other")
      }
    }

    const checkInstallation = () => {
      // Method 1: Check if running in standalone mode
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches

      // Method 2: Check if launched from homescreen (iOS)
      const isFromHomescreen = (window.navigator as any).standalone

      // Method 3: Check Android TWA
      const isTWA = document.referrer.includes("android-app://")

      // Method 4: Check Samsung Internet browser
      const isSamsungStandalone =
        navigator.userAgent.includes("SamsungBrowser") &&
        window.matchMedia("(display-mode: standalone)").matches

      // Set installed state if any method returns true
      setIsInstalled(isStandalone || isFromHomescreen || isTWA || isSamsungStandalone)
    }

    // Initial checks
    detectPlatform()
    checkInstallation()

    // Handle installation prompt for Android/Chrome
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    // Listen for changes in display mode
    const displayModeQuery = window.matchMedia("(display-mode: standalone)")
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches)
    }

    displayModeQuery.addEventListener("change", handleDisplayModeChange)
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any)
    window.addEventListener("appinstalled", () => setIsInstalled(true))

    // Check for Chrome/Android installation status changes
    if (platform === "android") {
      const relatedApps = (navigator as any).getInstalledRelatedApps?.()
      if (relatedApps) {
        relatedApps
          .then((apps: any[]) => {
            if (apps.length > 0) {
              setIsInstalled(true)
            }
          })
          .catch(() => {
            // Ignore errors, fall back to other detection methods
          })
      }
    }

    return () => {
      displayModeQuery.removeEventListener("change", handleDisplayModeChange)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any)
      window.removeEventListener("appinstalled", () => setIsInstalled(true))
    }
  }, [platform])

  const handleInstallClick = async () => {
    if (platform === "ios") {
      setShowIOSGuide(true)
    } else if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
          setDeferredPrompt(null)
          setIsInstalled(true)
        }
      } catch (error) {
        console.error("Error installing PWA:", error)
      }
    } else if (platform === "android") {
      // Fallback for Samsung Internet and other Android browsers
      alert('To install, tap the menu button (⋮) and select "Add to home screen"')
    }
  }

  const handleNextStep = () => {
    if (currentStep < iosSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowIOSGuide(false)
      setCurrentStep(0)
    }
  }

  // Don't render anything if the app is installed
  if (isInstalled) {
    return null
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-2 text-white bg-[#735721] rounded-lg"
      >
        {platform === "ios" ? <Share className="w-5 h-5" /> : <Download className="w-5 h-5" />}
        <span>Install App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full relative">
            <button
              onClick={() => {
                setShowIOSGuide(false)
                setCurrentStep(0)
              }}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex gap-2 justify-center mb-4">
                {iosSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full ${
                      index === currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                <div className={`flex justify-center mb-4 ${iosSteps[currentStep].animation}`}>
                  {iosSteps[currentStep].icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{iosSteps[currentStep].title}</h3>
                <p className="text-gray-600">{iosSteps[currentStep].description}</p>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep === iosSteps.length - 1 ? "Got it!" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AppDownloadButton
