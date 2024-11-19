import React, { useRef } from "react"
import { Camera } from "react-camera-pro"
import { X, Camera as CameraIcon } from "lucide-react"

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (photoData: string) => void
}

interface CameraRef {
  takePhoto: (type?: "base64url" | "imgData") => string
  switchCamera: () => "user" | "environment"
  getNumberOfCameras: () => number
  toggleTorch: () => boolean
  torchSupported: boolean
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const camera = useRef<CameraRef | null>(null)

  const handleCapture = (): void => {
    if (camera.current) {
      const photoData = camera.current.takePhoto()
      onCapture(photoData)
    }
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
              facingMode="user"
              numberOfCamerasCallback={(number: number) => {
                console.log(`Number of cameras: ${number}`)
              }}
              videoReadyCallback={() => {
                console.log("Video ready")
              }}
            />
          </div>

          <div className="flex justify-end gap-1 bg-[#d4d0c8]">
            <button
              onClick={handleCapture}
              type="button"
              className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
            >
              Capture
            </button>
            <button
              onClick={onClose}
              type="button"
              className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraModal
