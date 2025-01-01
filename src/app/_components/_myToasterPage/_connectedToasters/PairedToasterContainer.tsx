import type { Toaster, ToasterUser } from "@/app/page"
import { useEffect, useState } from "react"
import Image from "next/image"
import { User } from "lucide-react"
import { getUsersPairedToTaster } from "@/lib/queries/pairedToasters"

type PairedToasterContainerProps = {
  toaster: Toaster
}

function PairedToasterContainer({ toaster }: PairedToasterContainerProps) {
  const { pairedUsers, setPairedUsers } = usePairedUsersToToaster(toaster.id)
  const handleProfilePictureChange = async (
    toasterId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    console.log("Uploading file for toaster:", toasterId, file)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        {/* Top Section */}
        <div className="flex items-start gap-4 pb-4">
          <div className="relative w-16 h-16 flex-shrink-0 group">
            {toaster.profilePicture ? (
              <Image
                src={toaster.profilePicture}
                alt={`${toaster.name}'s profile`}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">🍞</span>
              </div>
            )}
            <label
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              htmlFor={`profile-upload-${toaster.id}`}
            >
              <span className="text-white text-sm">Change</span>
            </label>
            <input
              type="file"
              id={`profile-upload-${toaster.id}`}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleProfilePictureChange(toaster.id, e)}
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

        {/* Connected Users Section with full-width line */}
        <div className="flex items-center gap-3 w-full">
          <div className="text-sm font-medium text-gray-700">Users Paired to Toaster</div>
          <div className="h-px bg-gray-200 flex-grow" />
        </div>

        {/* Users List */}
        <div className="mt-3 flex flex-wrap gap-2">
          {pairedUsers?.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-sm"
            >
              {user.profileImageUrl ? (
                <div className="relative w-5 h-5">
                  <Image
                    src={user.profileImageUrl}
                    alt={user.userName}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-gray-700">{user.userName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const usePairedUsersToToaster = (printerId: string) => {
  const [pairedUsers, setPairedUsers] = useState<ToasterUser[]>()
  useEffect(() => {
    const getPairedUsers = async () => {
      const getUsers = await getUsersPairedToTaster(printerId)
      console.log(getUsers)
      setPairedUsers(getUsers.data)
    }
    getPairedUsers()
  }, [])
  return { pairedUsers, setPairedUsers }
}

export default PairedToasterContainer
