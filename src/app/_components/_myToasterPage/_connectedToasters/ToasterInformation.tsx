import type { Toaster } from "@/app/page"
import React from "react"
import Image from "next/image"
type ToasterInformationProps = {
  toaster: Toaster
}

function ToasterInformation({ toaster }: ToasterInformationProps) {
  const handleProfilePictureChange = async (
    toasterId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    console.log("Uploading file for toaster:", toasterId, file)
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
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
          htmlFor={`profile-upload-${toaster.id}`}
        >
          <span className="text-white text-sm">Change</span>
        </label>
        <input
          type="file"
          id={`profile-upload-${toaster.id}`}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleProfilePictureChange(toaster.id, e)}
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
