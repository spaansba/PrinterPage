import React, { useState, useRef, useEffect } from "react"
import ProfilePicture from "../../_profilePicture/ProfilePicture"
import { useToasterUser } from "@/app/context/userDataContext"
import { deleteFromBlob, uploadToBlob } from "@/lib/uploadToasterProfilePicture"
import { deleteToasterPairing, updateToasterInformation } from "@/lib/queries/toasterInfo"
import type { Toaster } from "@/app/types/printer"
import { Edit, Trash2, ImageUp } from "lucide-react"
import { MenuModal, type MenuOption } from "../../_helperComponents/MenuModal"
import { MAX_PROFILE_PICTURE_SIZE_IN_MB } from "@/lib/constants"
import { useUser } from "@clerk/nextjs"

type ToasterInformationProps = {
  toaster: Toaster
}

function ToasterInformation({ toaster }: ToasterInformationProps) {
  const { setPairedToasters, setFriendList } = useToasterUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()
  const handleNewProfilePicture = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("file", blob, `cropped-profile.jpg`)

      const maxSize = MAX_PROFILE_PICTURE_SIZE_IN_MB * 1024 * 1024 // 10MB in bytes
      if (blob.size > maxSize) {
        return {
          success: false,
          message: "Image size must be less than 10MB",
        }
      }

      const vercelBlobFolder = "ToasterProfilePicture"
      const { url } = await uploadToBlob(formData, vercelBlobFolder)

      const result = await updateToasterInformation(toaster.id, {
        profilePicture: url,
      })

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        }
      }

      if (toaster.profilePicture) {
        const blobDeleted = await deleteFromBlob(toaster.profilePicture)
        if (!blobDeleted.success) {
          console.error(blobDeleted.message)
        }
      }

      setPairedToasters((prevToasters) =>
        prevToasters.map((toast) =>
          toast.id === toaster.id ? { ...toast, profilePicture: url } : toast
        )
      )

      setFriendList((prevFriends) =>
        prevFriends.map((friend) =>
          friend.printerId === toaster.id ? { ...friend, profilePicture: url } : friend
        )
      )
      return {
        success: true,
        message: "",
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      return {
        success: false,
        message: "Error uploading profile picture:",
      }
    }
  }

  const menuOptions: MenuOption[] = [
    // {
    //   label: "Edit Name",
    //   icon: <Edit className="size-4" />,
    //   onClick: () => {},
    // },
    {
      label: "Edit Picture",
      icon: <ImageUp className="size-4" />,
      onClick: () => {
        fileInputRef.current?.click()
        setIsMenuOpen(false)
      },
    },
    {
      label: "Remove Toaster",
      icon: <Trash2 className="size-4" />,
      onClick: async () => await deleteToasterUserPairing(toaster.id, user?.id),
      className: "text-toastError",
    },
  ]

  const deleteToasterUserPairing = async (printerId: string, userId: string | null | undefined) => {
    if (!userId) {
      return
    }
    const deleted = await deleteToasterPairing(printerId, userId)
    if (!deleted.success) {
      console.error(deleted.message)
      return
    }
    setPairedToasters((prev) => prev.filter((t) => t.id !== printerId))
  }
  return (
    <div className="flex items-start gap-4">
      <div className="pt-1">
        <div className="relative size-14 flex-shrink-0 group">
          <ProfilePicture
            handleNewProfilePicture={handleNewProfilePicture}
            pictureURL={
              toaster.profilePicture
                ? toaster.profilePicture
                : "https://utfs.io/f/HgS7iFpfFqdY9JdpqoC60orpq5mxeKSliHZt1By84hAazv23"
            }
            altName={`${toaster.name}'s profile`}
            fileInputRef={fileInputRef}
          />
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-lg text-md text-gray-900">
              {toaster.name || `Toaster ${toaster.id}`}
            </div>
            <div className="text-sm text-gray-500 mt-1">ID: {toaster.id}</div>
            <div className="text-sm text-gray-500 mt-1">
              Toasts Received: {toaster.toastsReceived}
            </div>
          </div>

          <MenuModal isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} options={menuOptions} />
        </div>
      </div>
    </div>
  )
}

export default ToasterInformation
