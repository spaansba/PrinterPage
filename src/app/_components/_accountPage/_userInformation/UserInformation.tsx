import React from "react"
import UserName from "./UserName"
import ProfilePicture from "../../_profilePicture/ProfilePicture"
import { useUser } from "@clerk/nextjs"

export default function UserInformation() {
  const { user } = useUser()
  if (!user) {
    return
  }
  const handleNewProfilePicture = async (blob: Blob) => {
    try {
      //  setIsProfileImageUploading(true)
      const file = new File([blob], "profile.jpg", { type: blob.type })

      await user.setProfileImage({ file })
      return {
        success: true,
        message: "",
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      return {
        success: false,
        message: "Error uploading image",
      }
    }
  }
  return (
    <div className="flex gap-2">
      <div className="relative w-16 h-16 flex-shrink-0 group">
        <ProfilePicture
          altName="name"
          pictureURL={user.imageUrl}
          key={user.id}
          handleNewProfilePicture={handleNewProfilePicture}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <UserName />
      </div>
    </div>
  )
}
