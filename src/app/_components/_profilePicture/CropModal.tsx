import { useEditor } from "@tiptap/react"
import { Camera, X } from "lucide-react"
import React, { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop"

type CropModalProps = {
  setShowCropDialog: Dispatch<SetStateAction<boolean>>
  handleNewProfilePicture: (blob: Blob) => Promise<{
    success: boolean
    message: string
  }>
  imgSrc: string
}

function CropModal({ setShowCropDialog, handleNewProfilePicture, imgSrc }: CropModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [crop, setCrop] = useState<Crop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 60,
        },
        1,
        width,
        height
      ),
      width,
      height
    )
    setCrop(crop)
  }

  function setCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("No 2d context")
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) throw new Error("Failed to create blob")
          resolve(blob)
        },
        "image/jpeg",
        1
      )
    })
  }

  const handleSaveProfilePictue = async () => {
    if (imgRef.current && completedCrop) {
      setIsUploading(true)
      const blob = await setCroppedImg(imgRef.current, completedCrop)
      const pictureChanged = await handleNewProfilePicture(blob)
      if (!pictureChanged.success) {
        setUploadError(pictureChanged.message)
        setIsUploading(false)
        return
      }
      setIsUploading(false)
      setShowCropDialog(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-start pt-24 justify-center bg-black/50 z-50">
      <div className="bg-toastPrimary border-2 border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-[32rem]">
        <div className="bg-toastTertiary px-2 py-1 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Camera size={14} />
            <span className="text-sm">Crop Profile Picture</span>
          </div>
          <button
            onClick={() => setShowCropDialog(false)}
            className="size-7 flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-4 flex flex-col items-center">
          <div className="mb-4 flex justify-center w-full">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[60vh]"
                minWidth={50}
                keepSelection={true}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[60vh] w-auto"
                />
              </ReactCrop>
            )}
          </div>
          {uploadError && (
            <div className="w-full mb-4">
              <p className="text-toastError text-sm text-center">{uploadError}</p>
            </div>
          )}
          <div className="flex justify-end gap-1 bg-toastPrimary w-full">
            <button
              onClick={async () => {
                handleSaveProfilePictue()
              }}
              disabled={isUploading}
              className="h-7 px-4 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white disabled:opacity-50"
            >
              {isUploading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowCropDialog(false)}
              className="h-7 px-4 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CropModal
