import React from "react"
import Image from "next/image"
import { Circle, CircleCheckBig, CircleMinus } from "lucide-react"
import FriendProfilePicture from "../../_profilePicture/FriendProfilePicture"
import type { Friend } from "@/app/types/printer"

type FriendItemProps = {
  friend: Friend
  isSelected: Boolean
  handleFriendSelect: (selectedFriend: Friend) => void
}

function FriendItem({ friend, isSelected, handleFriendSelect }: FriendItemProps) {
  return (
    <div
      className={`group/friend md:hover:bg-toastPrimaryHover ${
        isSelected ? "bg-toastPrimaryHover" : "bg-toastWhite"
      } `}
    >
      <div
        onClick={() => handleFriendSelect(friend)}
        className="flex w-full items-center px-4 py-2 md:hover:bg-toastPrimaryHover cursor-pointer"
        title={`Toaster ID: ${friend.printerId}`}
      >
        <div className="flex gap-2 items-center">
          <FriendProfilePicture
            altName={friend.name}
            pictureUrl={friend.profilePicture}
            pictureSizeInPX={40}
          />
          <span>{friend.name}</span>
        </div>
        <div className="ml-auto">
          {isSelected ? (
            <>
              {/* Desktop version with hover effect */}
              <div className="hidden lg:block">
                <div className="ml-2 text-xs group-hover/friend:hidden">
                  <CircleCheckBig size={20} />
                </div>
                <div className="ml-2 text-xs hidden group-hover/friend:block">
                  <CircleMinus size={20} />
                </div>
              </div>
              {/* Mobile version - always show check */}
              <div className="lg:hidden ml-2 text-xs">
                <CircleCheckBig size={20} />
              </div>
            </>
          ) : (
            <div className="ml-2 text-xs">
              <Circle size={20} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendItem
