import { RefreshCcw } from "lucide-react"
import React from "react"

type ChangeFacingModeButtonProps = {
  cameraCount: number
  handleSwitchCamera: () => void
  isStreaming: boolean
}

function ChangeFacingModeButton({
  cameraCount,
  handleSwitchCamera,
  isStreaming,
}: ChangeFacingModeButtonProps) {
  return (
    <>
      {cameraCount > 1 && (
        <button
          onClick={handleSwitchCamera}
          type="button"
          disabled={!isStreaming}
          className="h-7 px-2 flex items-center gap-1 justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCcw size={20} />
        </button>
      )}
    </>
  )
}

export default ChangeFacingModeButton
