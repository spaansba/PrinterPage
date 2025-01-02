import React, { useState, useRef } from "react"
import Image from "next/image"
import { Camera, X } from "lucide-react"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { deleteFromBlob, uploadToBlob } from "@/lib/uploadToasterProfilePicture"
import { updateToasterInformation } from "@/lib/queries/toasterInfo"
import CropModal from "./CropModal"

type ProfilePictureProps = {
  pictureURL: string
  altName: string
  vercelBlobFolder: string
}

function ProfilePicture({ pictureURL, altName, vercelBlobFolder }: ProfilePictureProps) {
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

  const handleCropComplete = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("file", blob, `cropped-profile.jpg`)

      // Pass both the folder and old URL to the server action
      const { url } = await uploadToBlob(formData, vercelBlobFolder)

      // Update toaster with the new URL
      const result = await updateToasterInformation("fcs2ean4kg", {
        profilePicture: url,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      // If everything went well delete the old blob from vercel
      const blobDeleted = await deleteFromBlob(pictureURL)
      if (!blobDeleted.success) {
        console.error(blobDeleted.message)
      }
      // window.location.reload()
    } catch (error) {
      console.error("Error uploading profile picture:", error)
    } finally {
      setShowCropDialog(false)
    }
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
      />

      {showCropDialog && (
        <CropModal
          setShowCropDialog={setShowCropDialog}
          handleCropComplete={handleCropComplete}
          imgSrc={imgSrc}
        />
      )}
    </>
  )
}

export default ProfilePicture
