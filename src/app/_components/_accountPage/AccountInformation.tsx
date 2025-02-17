import { useToasterUser } from "@/app/context/userDataContext"
import { useClerk, useUser } from "@clerk/nextjs"
import React, { useRef, useState, type Dispatch, type SetStateAction } from "react"
import { MenuModal, type MenuOption } from "../_helperComponents/MenuModal"
import { Edit, ImageUp, LogOut, UserPen } from "lucide-react"
import ProfilePicture from "../_profilePicture/ProfilePicture"
import Username from "./Username"
import { formatDate } from "@/app/_helpers/getCurrentDate"

type AccountInformationProps = {
  setIsEditProfileModalOpen: Dispatch<SetStateAction<boolean>>
}

function AccountInformation({ setIsEditProfileModalOpen }: AccountInformationProps) {
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setPairedToasters, currentUser } = useToasterUser()
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const { signOut } = useClerk()
  if (!user) return

  const handleNewProfilePicture = async (blob: Blob) => {
    try {
      const file = new File([blob], "profile.jpg", { type: blob.type })
      await user.setProfileImage({ file })
      const localImageUrl = URL.createObjectURL(file)
      setPairedToasters((prev) => {
        return prev.map((toaster) => ({
          ...toaster,
          pairedAccounts: toaster.pairedAccounts?.map((account) =>
            account.id === user.id ? { ...account, profileImageUrl: localImageUrl } : account
          ),
        }))
      })
      return { success: true, message: "" }
    } catch (error) {
      console.error("Error uploading image: ", error)
      return { success: false, message: "Error uploading image ", error }
    }
  }

  const menuOptions: MenuOption[] = [
    {
      label: "Edit Username",
      icon: <Edit className="size-4" />,
      onClick: () => setIsEditingUsername(true),
    },
    {
      label: "Edit Picture",
      icon: <ImageUp className="size-4" />,
      onClick: () => {
        fileInputRef.current?.click()
        setIsMenuOpen(false)
      },
    },
    {
      label: "Edit Clerk",
      icon: <UserPen className="size-4" />,
      onClick: () => {
        setIsEditProfileModalOpen(true)
      },
    },
    {
      label: "Sign Out",
      icon: <LogOut className="size-4" />,
      onClick: () => {
        signOut()
      },
    },
  ]

  return (
    <div className="flex gap-3 mb-4">
      <div className="pt-3">
        <div className="relative size-14 flex-shrink-0">
          <ProfilePicture
            altName="name"
            pictureURL={user.imageUrl}
            key={user.id}
            handleNewProfilePicture={handleNewProfilePicture}
            fileInputRef={fileInputRef}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold text-sm">Account</h2>
            <div className="text-xs space-y-1 ">
              <div>
                <span className="text-gray-500">Name:</span>
                <div className="inline-block ml-1">
                  <Username
                    isEditingUsername={isEditingUsername}
                    setIsEditingUsername={setIsEditingUsername}
                  />
                </div>
              </div>
              <div>
                <span className="text-gray-500">Member Since:</span>
                <span className="ml-1">
                  {user.createdAt ? `${formatDate(user.createdAt, true)}` : "Not Found"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Toasts Send:</span>
                <span className="ml-1">{currentUser.toastsSend}</span>
              </div>
            </div>
          </div>
          {!isEditingUsername && (
            <MenuModal isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} options={menuOptions} />
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountInformation
