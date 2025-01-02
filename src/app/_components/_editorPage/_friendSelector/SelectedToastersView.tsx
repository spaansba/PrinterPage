import React from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import type { Friend } from "./FriendSelector"
import FriendProfilePicture from "../../_friendsPage/FriendProfilePicture"

type SelectedToastersViewProps = {
  selectedFriends: Friend[]
}
const maxVisibleRecipients = 5
function SelectedToastersView({ selectedFriends }: SelectedToastersViewProps) {
  return (
    <>
      <div className="flex flex-wrap items-start overflow-hidden w-[90%] gap-y-[0.4rem] gap-x-3">
        {selectedFriends.length > 0 ? (
          <>
            {selectedFriends.slice(0, maxVisibleRecipients).map((friend) => (
              <div key={friend.printerId} className="inline-flex items-center">
                <FriendProfilePicture friend={friend} pictureSizeInPX={32} />
                <span className="ml-2 whitespace-nowrap">{friend.name}</span>
              </div>
            ))}
            {selectedFriends.length > maxVisibleRecipients && (
              <div className="inline-flex items-center">
                <Image
                  src="/images/Logo512BW.png"
                  alt="Toaster"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <span className="whitespace-nowrap text-gray-600">
                  and {selectedFriends.length - maxVisibleRecipients} more
                </span>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-500">Select toaster...</span>
        )}
      </div>
      <ChevronDown className="flex-shrink-0" size={14} />
    </>
  )
}

export default SelectedToastersView
