import { useUser } from "@clerk/nextjs"
import { Camera, Loader2 } from "lucide-react"
import React, { useState } from "react"

function ProfilePicture() {
  const { user } = useUser()
  const [isProfileImageUploading, setIsProfileImageUploading] = useState(false)
  const [isProfileImageHovered, setIsProfileImageHovered] = useState(false)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    const file = e.target.files[0]

    try {
      setIsProfileImageUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      await user.setProfileImage({ file })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsProfileImageUploading(false)
    }
  }
  return (
    <div
      className="relative size-[5rem] flex-shrink-0 border-[1px] border-[#808080] overflow-hidden bg-gray-100 group"
      onMouseEnter={() => setIsProfileImageHovered(true)}
      onMouseLeave={() => setIsProfileImageHovered(false)}
    >
      {user?.imageUrl ? (
        <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div></div>
      )}

      <label
        className={`absolute inset-0 flex flex-col items-center justify-center bg-black/50 cursor-pointer transition-opacity
      ${isProfileImageHovered || isProfileImageUploading ? "opacity-100" : "opacity-0"}`}
        htmlFor="profile-image-upload"
      >
        {isProfileImageUploading ? (
          <Loader2 className="size-6 text-white animate-spin" />
        ) : (
          <Camera className="size-6 text-white" />
        )}
      </label>
      <input
        id="profile-image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}

export default ProfilePicture
