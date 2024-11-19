import React, { useCallback, useRef, useState, useEffect } from "react"
import { Camera, CameraType } from "react-camera-pro"
import { X, Camera as CameraIcon, AlertTriangle, Upload } from "lucide-react"

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (photoData: string) => void
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const camera = useRef<CameraType | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt")
  const [error, setError] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)

  // Request camera access when needed
  const requestCameraAccess = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in this browser")
      }

      console.log("Requesting camera access...")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      console.log("Camera access granted")

      streamRef.current = stream
      setError(null)
      setPermissionState("granted")
      return true
    } catch (err) {
      console.error("Camera access error:", err)

      if (err instanceof Error) {
        switch (err.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            setPermissionState("denied")
            setError("Camera permission was denied. Please allow camera access and try again.")
            break
          case "NotFoundError":
          case "DevicesNotFoundError":
            setError("No camera device was found on your device.")
            break
          case "NotReadableError":
          case "TrackStartError":
            setError(
              "Your camera is busy or not available. Please close other apps using the camera."
            )
            break
          default:
            setError(`Camera Error: ${err.message}`)
        }
      } else {
        setError("Failed to initialize camera")
      }
      return false
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop()
        })
        streamRef.current = null
      }
    }
  }, [])

  const handleTakePhoto = useCallback(async () => {
    if (permissionState === "prompt") {
      const granted = await requestCameraAccess()
      if (!granted) return
    }

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
  }, [permissionState])

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        if (!file.type.startsWith("image/")) {
          setError("Please select an image file")
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (typeof result === "string") {
            onCapture(result)
            onClose()
          }
        }
        reader.onerror = () => {
          setError("Failed to read the selected file")
        }
        reader.readAsDataURL(file)
      }
    },
    [onCapture, onClose]
  )

  const openGallery = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleAcceptPhoto = useCallback(() => {
    if (image) {
      onCapture(image)
      setImage(null)
      onClose()
    }
  }, [image, onCapture, onClose])

  const handleRetake = useCallback(() => {
    setImage(null)
    setError(null)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
      <div className="w-full max-w-md bg-[#d4d0c8] border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-[#735721] px-2 py-1 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <CameraIcon size={14} />
            <span className="text-sm">
              {permissionState === "granted" ? "Take Photo" : "Camera Access"}
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="size-7 flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="relative bg-black min-h-[300px]">
          {error ? (
            <div className="p-8 flex flex-col items-center justify-center text-white gap-4">
              <AlertTriangle className="text-yellow-400" size={24} />
              <p className="text-center">{error}</p>
              <button
                onClick={openGallery}
                type="button"
                className="mt-2 h-7 px-4 flex items-center justify-center gap-2 bg-[#d4d0c8] text-black border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
              >
                <Upload size={14} />
                Select from Gallery
              </button>
            </div>
          ) : !image && permissionState === "granted" ? (
            <Camera
              ref={camera}
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
          ) : image ? (
            <img src={image} alt="Captured photo" className="w-full h-auto" />
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-white gap-4">
              <p className="text-center">
                {permissionState === "prompt"
                  ? 'Click "Enable Camera" to start using your camera'
                  : "Camera access was denied. Please enable camera access in your browser settings."}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 flex justify-end gap-2">
          {!error && !image ? (
            <>
              <button
                onClick={openGallery}
                type="button"
                className="h-7 px-4 flex items-center justify-center gap-2 bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
              >
                <Upload size={14} />
                Gallery
              </button>
              {permissionState !== "denied" && (
                <button
                  onClick={handleTakePhoto}
                  type="button"
                  className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
                >
                  {permissionState === "prompt" ? "Enable Camera" : "Take Photo"}
                </button>
              )}
            </>
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default CameraModal
