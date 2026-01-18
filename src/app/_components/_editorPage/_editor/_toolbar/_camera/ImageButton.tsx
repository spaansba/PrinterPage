import { ImageIcon } from "lucide-react";
import React, { useState } from "react";
import CameraModal from "./CameraModal";
import { useEditorContext } from "@/app/context/editorContext";

function ImageButton() {
  const { editor } = useEditorContext();
  const [showCamera, setShowCamera] = useState(false);

  function triggerImageUpload() {
    // Shows the camera modal, if no camera model is found and on pc it opens the users directory
    setShowCamera(true);
  }
  const handleCameraCapture = (photoData: string) => {
    const pos = editor!.state.selection.from;
    editor!
      .chain()
      .focus()
      // .insertContent("<p> </p>") // possibility to add an space before every picture
      .setImage({ src: photoData, alt: "[Camera photo]" })
      .setTextSelection(pos + 3)
      .run();
    setShowCamera(false);
  };
  return (
    <>
      <button
        onMouseDown={() => triggerImageUpload()}
        className="size-7 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
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
  );
}

export default ImageButton;
