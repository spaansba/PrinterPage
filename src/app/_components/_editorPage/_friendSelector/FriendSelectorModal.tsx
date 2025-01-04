import React from "react"
import FriendItem from "./FriendItem"
import type { FriendListHook } from "../../AppWindow"
import AddNewFriend from "./AddNewFriend"
import type { Friend } from "@/app/types/printer"

type FriendSelectorModalProps = {
  handleFriendSelect: (selectedFriend: Friend) => void
  friendsHook: FriendListHook
}

function FriendSelectorModal({ handleFriendSelect, friendsHook }: FriendSelectorModalProps) {
  const { friendList, selectedFriends } = friendsHook

  return (
    <div className="max-h-[30rem] overflow-y-auto">
      {friendList.map((friend) => (
        <FriendItem
          key={friend.printerId}
          friend={friend}
          isSelected={selectedFriends?.includes(friend)}
          handleFriendSelect={handleFriendSelect}
        />
      ))}

      <AddNewFriend friendsHook={friendsHook} />
    </div>
  )
}

export default FriendSelectorModal
