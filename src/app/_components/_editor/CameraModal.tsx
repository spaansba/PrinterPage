import React, { useCallback, useRef, useState, useEffect } from "react"
import { Camera, CameraType } from "react-camera-pro"
import { X, Camera as CameraIcon, AlertTriangle } from "lucide-react"

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (photoData: string) => void
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const camera = useRef<CameraType | null>(null)
  const [numberOfCameras, setNumberOfCameras] = useState<number>(0)
  const [image, setImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraSupported, setIsCameraSupported] = useState<boolean>(false)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        // Check if running in a secure context
        if (!window.isSecureContext) {
          throw new Error("Camera access requires a secure context (HTTPS)")
        }

        // Check for getUserMedia support across different browsers
        const getUserMedia =
          navigator.mediaDevices?.getUserMedia ||
          (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia ||
          (navigator as any).msGetUserMedia

        if (!getUserMedia) {
          throw new Error("Camera API is not supported in your browser")
        }

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Prefer back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })

        // Store stream reference
        streamRef.current = stream

        // Check if we actually got video tracks
        if (!stream.getVideoTracks().length) {
          throw new Error("No camera device found")
        }

        setIsCameraSupported(true)
        setError(null)
      } catch (err) {
        console.error("Camera initialization error:", err)
        let errorMessage = "Failed to initialize camera"

        if (err instanceof Error) {
          // Provide more user-friendly error messages
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            errorMessage = "Camera permission was denied. Please allow camera access and try again."
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            errorMessage = "No camera device was found on your device."
          } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
            errorMessage =
              "Your camera is busy or not available. Please close other apps using the camera."
          } else if (err.name === "OverconstrainedError") {
            errorMessage = "Could not find a suitable camera. Please try a different device."
          } else if (err.message) {
            errorMessage = err.message
          }
        }

        setError(errorMessage)
        setIsCameraSupported(false)
      }
    }

    if (isOpen) {
      checkCameraSupport()
    }

    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks()
        tracks.forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [isOpen])

  const handleTakePhoto = useCallback((): void => {
    if (camera.current) {
      try {
        const photo = camera.current.takePhoto()
        if (photo instanceof ImageData) {
          const canvas = document.createElement("canvas")
          canvas.width = photo.width
          canvas.height = photo.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.putImageData(photo, 0, 0)
            setImage(canvas.toDataURL("image/jpeg"))
          }
        } else {
          setImage(photo)
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to take photo")
      }
    }
  }, [])

  const handleAcceptPhoto = useCallback((): void => {
    if (image) {
      onCapture(image)
      setImage(null)
      onClose()
    }
  }, [image, onCapture, onClose])

  const handleRetake = useCallback((): void => {
    setImage(null)
    setError(null)
  }, [])

  // Fallback to file input if camera is not supported
  const handleFileInput = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          onCapture(dataUrl)
          onClose()
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }, [onCapture, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
      <div className="w-full max-w-md bg-[#d4d0c8] border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-[#735721] px-2 py-1 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <CameraIcon size={14} />
            <span className="text-sm">Take Photo</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="size-7 flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="relative bg-black">
          {error ? (
            <div className="p-8 flex flex-col items-center justify-center text-white gap-4">
              <AlertTriangle className="text-yellow-400" size={24} />
              <p className="text-center">{error}</p>
              <button
                onClick={handleFileInput}
                type="button"
                className="mt-2 h-7 px-4 flex items-center justify-center bg-[#d4d0c8] text-black border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
              >
                Select from Gallery
              </button>
            </div>
          ) : !image && isCameraSupported ? (
            <Camera
              ref={camera}
              numberOfCamerasCallback={setNumberOfCameras}
              facingMode="environment"
              aspectRatio={16 / 9}
              errorMessages={{
                noCameraAccessible: "No camera device accessible",
                permissionDenied:
                  "Permission denied. Please refresh and grant access to your camera.",
                switchCamera:
                  "It is not possible to switch camera to different one because there is only one video device accessible.",
                canvas: "Canvas is not supported.",
              }}
            />
          ) : (
            image && <img src={image} alt="Captured photo" className="w-full h-auto" />
          )}
        </div>

        <div className="p-4 flex justify-end gap-2">
          {!error && !image ? (
            <button
              onClick={handleTakePhoto}
              type="button"
              disabled={!isCameraSupported}
              className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Take Photo
            </button>
          ) : image ? (
            <>
              <button
                onClick={handleRetake}
                type="button"
                className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
              >
                Retake
              </button>
              <button
                onClick={handleAcceptPhoto}
                type="button"
                className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
              >
                Accept
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default CameraModal
