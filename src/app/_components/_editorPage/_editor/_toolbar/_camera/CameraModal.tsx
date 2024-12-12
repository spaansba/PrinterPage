import React, { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import CameraTitle from "./CameraTitle"
import CameraPreview from "./CameraPreview"
import CameraButtons from "./CameraButtons"

type CameraModalProps = {
  isOpen: boolean
  onClose: () => void
  onCapture: (photoData: string) => void
}

export type videoConstraints = {
  width: number
  height: number
  facingMode: FacingMode
}

type FacingMode = "user" | "environment"

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef<Webcam>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>("user")
  const [cameraCount, setCameraCount] = useState(0)
  const [isStreaming, setIsStreaming] = useState(false)
  const hasCheckedCameraRef = useRef(false)

  // Define consistent dimensions that match the editor's needs
  const videoConstraints: videoConstraints = {
    width: 480,
    height: 480,
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

  function handleCaptureWebcam() {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({
        width: videoConstraints.width,
        height: videoConstraints.height,
      })
      if (imageSrc) {
        onCapture(imageSrc)
      }
    }
  }

  const handleSwitchCamera = (): void => {
    if (webcamRef.current) {
      setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"))
    }
  }

  if (!isOpen || cameraCount < 1) return null

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black/50 z-50">
      <div className="bg-[#d4d0c8] border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl">
        <CameraTitle onClose={onClose} />
        <div className="p-4">
          <CameraPreview
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
            videoConstraints={videoConstraints}
            webcamRef={webcamRef}
          />
          <CameraButtons
            cameraCount={cameraCount}
            handleCaptureWebcam={handleCaptureWebcam}
            handleSwitchCamera={handleSwitchCamera}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  )
}

export default CameraModal
