import React from "react"
import Webcam from "react-webcam"
import type { videoConstraints } from "./CameraModal"

type CameraPreviewProps = {
  videoConstraints: videoConstraints
  isStreaming: boolean
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>
  webcamRef: React.RefObject<Webcam | null>
}

function CameraPreview({
  videoConstraints,
  isStreaming,
  setIsStreaming,
  webcamRef,
}: CameraPreviewProps) {
  return (
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
          mirrored={videoConstraints.facingMode === "user"}
          screenshotFormat="image/jpeg"
          className="absolute inset-0 w-full h-full object-cover"
          videoConstraints={videoConstraints}
          onUserMedia={() => setIsStreaming(true)}
        />
      </div>
    </div>
  )
}

export default CameraPreview
