import { CameraIcon } from "lucide-react";
import React from "react";

type CaptureButtonProps = {
  handleCaptureWebcam: () => void;
  isStreaming: boolean;
};

function CaptureButton({
  handleCaptureWebcam,
  isStreaming,
}: CaptureButtonProps) {
  return (
    <div className="flex gap-1">
      <button
        onClick={handleCaptureWebcam}
        type="button"
        disabled={!isStreaming}
        className="h-7 px-4 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CameraIcon size={30} />
      </button>
    </div>
  );
}

export default CaptureButton;
