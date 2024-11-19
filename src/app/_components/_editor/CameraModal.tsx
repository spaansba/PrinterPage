import React, { useRef, useState } from "react"
import { Camera } from "react-camera-pro"
import { X, Camera as CameraIcon, RefreshCcw, Image } from "lucide-react"
import type { CameraType } from "react-camera-pro"
import type { FacingMode } from "react-camera-pro/dist/components/Camera/types"

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (photoData: string) => void
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const camera = useRef<CameraType>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>("user")
  const [numberOfCameras, setNumberOfCameras] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (): void => {
    if (camera.current) {
      const photoData = camera.current.takePhoto()
      if (typeof photoData === "string") {
        // Use window.Image constructor explicitly
        const img = new window.Image()
        const canvas = document.createElement("canvas")

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            if (facingMode === "user") {
              // Flip the image horizontally for front camera
              ctx.translate(canvas.width, 0)
              ctx.scale(-1, 1)
              ctx.drawImage(img, 0, 0)
            } else {
              // Don't flip for back camera
              ctx.drawImage(img, 0, 0)
            }
            onCapture(canvas.toDataURL("image/jpeg"))
          }
        }
        img.src = photoData
      }
    }
  }

  const handleSwitchCamera = (): void => {
    if (camera.current) {
      const newMode = camera.current.switchCamera()
      setFacingMode(newMode)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          onCapture(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#d4d0c8] border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl">
        <div className="bg-[#735721] px-2 py-1 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <CameraIcon size={14} />
            <span className="text-sm">Take Photo</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="size-7 flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative w-full h-64 mb-4 bg-black overflow-hidden">
            {/* Black and white filter overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none backdrop-grayscale backdrop-brightness-80" />

            <Camera
              ref={camera}
              errorMessages={{
                noCameraAccessible:
                  "No camera device accessible. Please connect your camera or try a different browser.",
                permissionDenied: "Permission denied. Please refresh and give camera permission.",
                switchCamera:
                  "It is not possible to switch camera to different one because there is only one video device accessible.",
                canvas: "Canvas is not supported.",
              }}
              aspectRatio="cover"
              facingMode={facingMode}
              numberOfCamerasCallback={(number: number) => {
                setNumberOfCameras(number)
              }}
            />
          </div>

          <div className="flex justify-between items-center gap-1 bg-[#d4d0c8]">
            <div className="flex gap-1">
              <button
                onClick={triggerFileInput}
                type="button"
                className="h-7 px-2 flex items-center gap-1 justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <Image size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif" // Specify exact file types instead of image/*
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleCapture}
                type="button"
                className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <CameraIcon size={30} />
              </button>
            </div>
            {numberOfCameras > 1 && (
              <button
                onClick={handleSwitchCamera}
                type="button"
                className="h-7 px-2 flex items-center gap-1 justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <RefreshCcw size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraModal
