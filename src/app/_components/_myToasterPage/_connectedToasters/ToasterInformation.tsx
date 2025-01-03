import ProfilePicture from "../../_profilePicture/ProfilePicture"
import { useToasterUser } from "@/app/context/userDataContext"
import { deleteFromBlob, uploadToBlob } from "@/lib/uploadToasterProfilePicture"
import { updateToasterInformation } from "@/lib/queries/toasterInfo"
import type { Toaster } from "@/app/types/printer"

type ToasterInformationProps = {
  toaster: Toaster
}

function ToasterInformation({ toaster }: ToasterInformationProps) {
  const { setPairedToasters, setFriendList } = useToasterUser()

  const handleNewProfilePicture = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("file", blob, `cropped-profile.jpg`)

      // Pass both the folder and old URL to the server action
      const vercelBlobFolder = "ToasterProfilePicture"
      const { url } = await uploadToBlob(formData, vercelBlobFolder)

      // Update toaster with the new URL
      const result = await updateToasterInformation("fcs2ean4kg", {
        profilePicture: url,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      // If everything went well delete the old blob from vercel
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
          <button className="text-gray-400 hover:text-gray-600" title="More options">
            •••
            {/* TODO: add buttons */}
          </button>
        </div>
      </div>
    </div>
  )
}

// const useProfilePictureUpload = () => {

//   return { isUploading, setIsUploading }
// }
export default ToasterInformation
