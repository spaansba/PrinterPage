import React, { useEffect, useRef, useState } from "react"
import { X, Camera as CameraIcon, RefreshCcw, Image } from "lucide-react"
import Webcam from "react-webcam"

type CameraModalProps = {
  isOpen: boolean
  onClose: () => void
  onCapture: (photoData: string) => void
}

type FacingMode = "user" | "environment"

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef<Webcam>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>("user")
  const [cameraCount, setCameraCount] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const hasCheckedCameraRef = useRef(false)

  // Define consistent dimensions that match the editor's needs
  const videoConstraints = {
    width: 480, // Reduced width for better editor compatibility
    height: 480, // Square aspect ratio for consistent results
    facingMode: facingMode,
  }

  useEffect(() => {
    if (!isOpen) {
      hasCheckedCameraRef.current = false
      return
    }

    if (hasCheckedCameraRef.current) return
    hasCheckedCameraRef.current = true

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        return navigator.mediaDevices.enumerateDevices()
      })
      .then((devices) => {
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setCameraCount(videoDevices.length)
        if (videoDevices.length < 1) {
          const inputElement = document.createElement("input")
          inputElement.type = "file"
          inputElement.accept = "image/png, image/jpeg"
          inputElement.className = "hidden"

          document.body.appendChild(inputElement)
          inputElement.addEventListener("change", (e) => {
            const target = e.target as HTMLInputElement
            const file = target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onloadend = () => {
                if (typeof reader.result === "string") {
                  onCapture(reader.result)
                }
              }
              reader.readAsDataURL(file)
            }
            inputElement.remove()
            onClose()
          })
          inputElement.click()
        }
      })
      .catch((error) => {
        console.info("No camera found: ", error)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
        // When we dont find a camera, go to the users directory and let them pick a picture
        if (!isMobile) {
          openFileSystem()
        }
        onClose()
      })
  }, [isOpen])

  function openFileSystem() {
    const inputElement = document.createElement("input")
    inputElement.type = "file"
    inputElement.accept = "image/png, image/jpeg"
    inputElement.className = "hidden"

    document.body.appendChild(inputElement)
    inputElement.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            onCapture(reader.result)
          }
        }
        reader.readAsDataURL(file)
      }
      inputElement.remove()
    })
    inputElement.click()
  }

  const handleSwitchCamera = (): void => {
    if (webcamRef.current) {
      setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"))
    }
  }

  function captureWebcam() {
    if (webcamRef.current) {
      // Use the same dimensions as the video constraints
      const imageSrc = webcamRef.current.getScreenshot({
        width: videoConstraints.width,
        height: videoConstraints.height,
      })
      if (imageSrc) {
        onCapture(imageSrc)
      }
    }
  }

  if (!isOpen || cameraCount < 1) return null

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/50 z-50">
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
          <div className="relative w-full aspect-square mb-4 bg-black overflow-hidden">
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white">Loading camera...</div>
              </div>
            )}

            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                isStreaming ? "opacity-100" : "opacity-0"
              }`}
            >
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={facingMode === "user"}
                screenshotFormat="image/jpeg"
                className="absolute inset-0 w-full h-full object-cover"
                videoConstraints={videoConstraints}
                onUserMedia={() => setIsStreaming(true)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center gap-1 bg-[#d4d0c8]">
            <div className="flex gap-1">
              <button
                onClick={captureWebcam}
                type="button"
                disabled={!isStreaming}
                className="h-7 px-4 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CameraIcon size={30} />
              </button>
            </div>
            {cameraCount > 1 && (
              <button
                onClick={handleSwitchCamera}
                type="button"
                disabled={!isStreaming}
                className="h-7 px-2 flex items-center gap-1 justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white disabled:opacity-50 disabled:cursor-not-allowed"
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
