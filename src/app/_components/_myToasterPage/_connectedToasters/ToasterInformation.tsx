import React, { useState, useRef, useEffect } from "react"
import ProfilePicture from "../../_profilePicture/ProfilePicture"
import { useToasterUser } from "@/app/context/userDataContext"
import { deleteFromBlob, uploadToBlob } from "@/lib/uploadToasterProfilePicture"
import { updateToasterInformation } from "@/lib/queries/toasterInfo"
import type { Toaster } from "@/app/types/printer"
import { Edit, Trash2, ImageUp } from "lucide-react"
import { MenuModal, type MenuOption } from "../../_helperComponents/MenuModal"

type ToasterInformationProps = {
  toaster: Toaster
}

function ToasterInformation({ toaster }: ToasterInformationProps) {
  const { setPairedToasters, setFriendList } = useToasterUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNewProfilePicture = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("file", blob, `cropped-profile.jpg`)

      const vercelBlobFolder = "ToasterProfilePicture"
      const { url } = await uploadToBlob(formData, vercelBlobFolder)

      const result = await updateToasterInformation(toaster.id, {
        profilePicture: url,
      })

      if (!result.success) {
        throw new Error(result.message)
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
    {
      label: "Edit Name",
      icon: <Edit className="size-4" />,
      onClick: () => {},
    },
    {
      label: "Edit Picture",
      icon: <ImageUp className="size-4" />,
      onClick: () => {
        // Handle edit
      },
    },
    {
      label: "Remove Toaster",
      icon: <Trash2 className="size-4" />,
      onClick: () => {
        // Handle remove
      },
      className: "text-toastError",
    },
  ]

  return (
    <div className="flex items-start gap-4 pb-4">
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
