import type { Toaster } from "@/app/page"
import React, { useState } from "react"
import Image from "next/image"
import { put } from "@vercel/blob"
import { updateToasterInformation } from "@/lib/queries/toasterInfo"
import { uploadToBlob } from "@/lib/uploadToasterProfilePicture"

type ToasterInformationProps = {
  toaster: Toaster
}

function ToasterInformation({ toaster }: ToasterInformationProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Create FormData and append the file
      const formData = new FormData()
      formData.append("file", file)

      // Upload using server action
      const { url } = await uploadToBlob(formData)

      // Update toaster with the new URL
      const result = await updateToasterInformation(toaster.id, {
        profilePicture: url,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      // Optionally refresh the page or update local state
      window.location.reload()
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      // You might want to show an error message to the user
    } finally {
      setIsUploading(false)
    }
  }
  return (
    <div className="flex items-start gap-4 pb-4">
      <div className="relative w-16 h-16 flex-shrink-0 group">
        {toaster.profilePicture ? (
          <Image
            src={toaster.profilePicture}
            alt={`${toaster.name}'s profile`}
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">🍞</span>
          </div>
        )}
        <label
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ${
            isUploading ? "cursor-wait" : "cursor-pointer"
          }`}
          htmlFor={`profile-upload-${toaster.id}`}
        >
          <span className="text-white text-sm">{isUploading ? "Uploading..." : "Change"}</span>
        </label>
        <input
          type="file"
          id={`profile-upload-${toaster.id}`}
          className="hidden"
          accept="image/*"
          onChange={handleProfilePictureChange}
          disabled={isUploading}
        />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-gray-900">
              {toaster.name || `Toaster ${toaster.id}`}
            </div>
            <div className="text-sm text-gray-500 mt-1">ID: {toaster.id}</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600" title="More options">
            •••
          </button>
        </div>
      </div>
    </div>
  )
}

export default ToasterInformation
