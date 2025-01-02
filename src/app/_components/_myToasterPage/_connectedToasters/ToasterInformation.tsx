import type { Toaster } from "@/app/page"
import ProfilePicture from "../../_profilePicture/ProfilePicture"

type ToasterInformationProps = {
  toaster: Toaster
}

function ToasterInformation({ toaster }: ToasterInformationProps) {
  return (
    <div className="flex items-start gap-4 pb-4">
      <div className="relative w-16 h-16 flex-shrink-0 group">
        <ProfilePicture
          pictureURL={
            toaster.profilePicture
              ? toaster.profilePicture
              : "https://utfs.io/f/HgS7iFpfFqdY1SuOpIcrIgrQG4suNhE1Z8XYiCSnofzHybqm"
          }
          altName={`${toaster.name}'s profile`}
          vercelBlobFolder="ToasterProfilePicture"
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

// const useProfilePictureUpload = () => {

//   return { isUploading, setIsUploading }
// }
export default ToasterInformation
