import { useUser } from "@clerk/nextjs"
import { Camera, Loader2, Mail, User } from "lucide-react"
import React, { useState } from "react"

function AccountPage() {
  const { user } = useUser()
  const [isUploading, setIsUploading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    const file = e.target.files[0]

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      await user.setProfileImage({ file })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }
  return (
    <>
      <div className="px-1 py-1 flex items-center gap-1 ">
        <button>asdasd</button>
        <button>asdasd</button>
        <button>asdasd</button>
        <button>asdasd</button>
      </div>
      <div className="p-2 border-t border-[1px] border-gray-500 bg-white flex gap-2 ">
        {/* Profile Image */}
        <div
          className="relative size-[5rem] flex-shrink-0 border-[1px] border-[#808080]  overflow-hidden bg-gray-100 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div></div>
          )}

          {/* Upload Overlay */}
          <label
            className={`absolute inset-0 flex flex-col items-center justify-center bg-black/50 cursor-pointer transition-opacity
          ${isHovered || isUploading ? "opacity-100" : "opacity-0"}`}
            htmlFor="profile-image-upload"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-6 text-white animate-spin" />
              </>
            ) : (
              <>
                <Camera className="size-6 text-white" />
              </>
            )}
          </label>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e)}
            className="hidden"
          />
        </div>
        <div className="flex flex-col  flex-1 min-w-0">
          <div
            title={user?.fullName ? user?.fullName : ""}
            className="text-[16px] font-medium items-center flex gap-1 min-w-0"
          >
            <User size={10} color="black" className="flex-shrink-0" />
            <span className="truncate">{user?.fullName}</span>
          </div>
          <div className="text-[16px] font-medium items-center flex gap-1 min-w-0">
            <Mail size={10} color="black" className="flex-shrink-0" />
            <span className="truncate">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default AccountPage
