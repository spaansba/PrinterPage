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
      <div>
        {/*  dont remove div */}
        <div className="flex items-center gap-3 w-full">
          <div className="text-sm font-medium text-gray-700">Users Paired to Toaster</div>
          <div className="h-px  flex-grow" />
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {toaster.pairedAccounts?.map((account) => (
            <div key={`${toaster.id} & ${account.id}`} className="flex items-center gap-2">
              <FriendProfilePicture
                pictureUrl={
                  account.profileImageUrl ||
                  "https://utfs.io/f/HgS7iFpfFqdY9JdpqoC60orpq5mxeKSliHZt1By84hAazv23"
                }
                altName={account.username}
                pictureSizeInPX={28}
              />
              <span className="text-gray-700">{account.username}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default PairedUserList
