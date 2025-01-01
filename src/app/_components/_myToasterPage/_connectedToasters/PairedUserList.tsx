import type { Toaster, ToasterUser } from "@/app/page"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import { User } from "lucide-react"
import { getUsersPairedToTaster } from "@/lib/queries/toasterInfo"

type PairedUserList = {
  toaster: Toaster
}

function PairedUserList({ toaster }: PairedUserList) {
  const { pairedUsers, setPairedUsers } = usePairedUsersToToaster(toaster.id)
  return (
    <>
      {/* Connected Users Section with full-width line */}
      <div className="flex items-center gap-3 w-full">
        <div className="text-sm font-medium text-gray-700">Users Paired to Toaster</div>
        <div className="h-px bg-gray-200 flex-grow" />
      </div>
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
    </>
  )
}

const usePairedUsersToToaster = (printerId: string) => {
  const [pairedUsers, setPairedUsers] = useState<ToasterUser[]>([])
  useEffect(() => {
    const getPairedUsers = async () => {
      const getUsers = await getUsersPairedToTaster(printerId)
      setPairedUsers(getUsers.data)
    }
    getPairedUsers()
  }, [])
  return { pairedUsers, setPairedUsers }
}

export default PairedUserList
