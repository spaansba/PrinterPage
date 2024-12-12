import { CameraIcon, X } from "lucide-react"
import React from "react"

type CameraTitleProps = {
  onClose: () => void
}

function CameraTitle({ onClose }: CameraTitleProps) {
  return (
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
  )
}

export default CameraTitle
