import { ImageIcon } from "lucide-react"
import React, { useRef, useState } from "react"
import CameraModal from "./CameraModal"
import { useEditorContext } from "@/app/context/editorContext"
import CameraTitle from "./CameraTitle"
import CameraPreview from "./CameraPreview"
import CameraButtons from "./CameraButtons"

function ImageButton() {
  const { editor } = useEditorContext()
  const [showCamera, setShowCamera] = useState(false)
  const camera = useRef(null)

  function triggerImageUpload() {
    // Shows the camera modal, if no camera model is found and on pc it opens the users directory
    setShowCamera(true)
  }
  const handleCameraCapture = (photoData: string) => {
    const pos = editor!.state.selection.from
    editor!
      .chain()
      .focus()
      .setImage({ src: photoData, alt: "[Camera photo]" })
      .setTextSelection(pos + 3)
      .run()
    setShowCamera(false)
  }
  return (
    <>
      <button
        onMouseDown={() => triggerImageUpload()}
        className="size-7 flex items-center justify-center bg-[#d4d0c8] border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
      >
        <ImageIcon size={15} />
      </button>
      {showCamera && (
        <CameraModal
          isOpen={showCamera}
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  )
}

export default ImageButton
