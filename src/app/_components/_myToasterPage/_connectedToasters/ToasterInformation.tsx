import React, { useState, useRef, useEffect } from "react"
import ProfilePicture from "../../_profilePicture/ProfilePicture"
import { useToasterUser } from "@/app/context/userDataContext"
import { deleteFromBlob, uploadToBlob } from "@/lib/uploadToasterProfilePicture"
import { updateToasterInformation } from "@/lib/queries/toasterInfo"
import type { Toaster } from "@/app/types/printer"
import { MoreVertical, Edit, Trash2, RefreshCw } from "lucide-react"

type ToasterInformationProps = {
  toaster: Toaster
}

function ToasterInformation({ toaster }: ToasterInformationProps) {
  const { setPairedToasters, setFriendList } = useToasterUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  return (
    <div className="flex items-start gap-4 pb-4">
      <div className="relative w-16 h-16 flex-shrink-0 group">
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
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-gray-900">
              {toaster.name || `Toaster ${toaster.id}`}
            </div>
            <div className="text-sm text-gray-500 mt-1">{toaster.id}</div>
          </div>

          <div className="relative">
            <button
              ref={buttonRef}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 w-48 mt-1 bg-white rounded-lg border shadow-lg z-50 py-1"
              >
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
                  onClick={() => {
                    // Handle edit
                    setIsMenuOpen(false)
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Name
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm"
                  onClick={() => {
                    // Handle reconnect
                    setIsMenuOpen(false)
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reconnect
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-sm text-red-600"
                  onClick={() => {
                    // Handle remove
                    setIsMenuOpen(false)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToasterInformation
