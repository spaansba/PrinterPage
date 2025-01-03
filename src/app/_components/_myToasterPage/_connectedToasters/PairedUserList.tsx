import React from "react"
import type { Toaster } from "@/app/types/printer"
import FriendProfilePicture from "../../_profilePicture/FriendProfilePicture"

type PairedUserListProps = {
  toaster: Toaster
}

function PairedUserList({ toaster }: PairedUserListProps) {
  return (
    <>
      {/* Connected Users Section with full-width line */}
      <div className="flex items-center gap-3 w-full">
        <div className="text-sm font-medium text-gray-700">Users Paired to Toaster</div>
        <div className="h-px bg-gray-200 flex-grow" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {toaster.pairedAccounts?.map((account) => (
          <div
            key={account.id}
            className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-sm"
          >
            <FriendProfilePicture
              pictureUrl="https://utfs.io/f/HgS7iFpfFqdY9JdpqoC60orpq5mxeKSliHZt1By84hAazv23"
              altName={account.userName}
              pictureSizeInPX={28}
            />
            <span className="text-gray-700">{account.userName}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default PairedUserList
