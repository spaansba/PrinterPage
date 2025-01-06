import React, { useState, useRef } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
import "react-image-crop/dist/ReactCrop.css"
import CropModal from "./CropModal"

type ProfilePictureProps = {
  handleNewProfilePicture: (blob: Blob) => Promise<{
    success: boolean
    message: string
  }>
  pictureURL: string
  altName: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

function ProfilePicture({
  handleNewProfilePicture,
  pictureURL,
  altName,
  fileInputRef,
}: ProfilePictureProps) {
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [imgSrc, setImgSrc] = useState("")

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "")
    })
    reader.readAsDataURL(file)
    setShowCropDialog(true)
  }

  return (
    <>
      <Image
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        src={pictureURL}
        alt={altName}
        fill
        sizes="(max-width: 768px) 96px, 128px"
        className="rounded-full object-cover pointer-events-none"
      />

      <label
        className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity`}
        htmlFor={`profile-upload-${pictureURL}`}
      >
        <span className="text-white text-sm">{<Camera />}</span>
      </label>
      <input
        type="file"
        id={`profile-upload-${pictureURL}`}
        className="hidden"
        accept="image/*"
        onChange={handleProfilePictureChange}
        ref={fileInputRef}
      />

      {showCropDialog && (
        <CropModal
          setShowCropDialog={setShowCropDialog}
          handleNewProfilePicture={handleNewProfilePicture}
          imgSrc={imgSrc}
        />
      )}
    </>
  )
}

export default ProfilePicture
