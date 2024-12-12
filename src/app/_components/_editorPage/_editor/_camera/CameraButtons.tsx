import { CameraIcon, RefreshCcw } from "lucide-react"
import React from "react"
import CaptureButton from "./CaptureButton"
import ChangeFacingModeButton from "./ChangeFacingModeButton"

type CameraButtonsProps = {
  handleCaptureWebcam: () => void
  handleSwitchCamera: () => void
  isStreaming: boolean
  cameraCount: number
}

function CameraButtons({
  handleCaptureWebcam,
  handleSwitchCamera,
  isStreaming,
  cameraCount,
}: CameraButtonsProps) {
  return (
    <>
      <div className="flex justify-between items-center gap-1 bg-[#d4d0c8]">
        <CaptureButton handleCaptureWebcam={handleCaptureWebcam} isStreaming={isStreaming} />
        <ChangeFacingModeButton
          handleSwitchCamera={handleSwitchCamera}
          isStreaming={isStreaming}
          cameraCount={cameraCount}
        />
      </div>
    </>
  )
}

export default CameraButtons
