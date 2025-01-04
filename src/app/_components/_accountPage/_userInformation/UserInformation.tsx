import React, { useEffect } from "react"
import UserName from "./UserName"
import ProfilePicture from "../../_profilePicture/ProfilePicture"
import { useUser } from "@clerk/nextjs"
import { useToasterUser } from "@/app/context/userDataContext"

export default function UserInformation() {
  const { user } = useUser()
  const { currentUser } = useToasterUser()
  if (!user || currentUser.id != user.id) {
    return
  }

  const { setPairedToasters } = useToasterUser()

  const handleNewProfilePicture = async (blob: Blob) => {
    try {
      const file = new File([blob], "profile.jpg", { type: blob.type })

      await user.setProfileImage({ file })
      const localImageUrl = URL.createObjectURL(file)

      setPairedToasters((prev) => {
        return prev.map((toaster) => ({
          ...toaster,
          pairedAccounts: toaster.pairedAccounts?.map((account) =>
            account.id === user.id
              ? {
                  ...account,
                  profileImageUrl: localImageUrl,
                }
              : account
          ),
        }))
      })
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
