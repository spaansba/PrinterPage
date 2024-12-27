import React, { useEffect, useRef, useState } from "react"
import FriendItem from "./FriendItem"
import type { Friend } from "./FriendSelector"
import type { FriendListHook } from "../../AppWindow"
import { Plus } from "lucide-react"
import AddNewFriendForm from "../AddNewFriendForm"

type FriendSelectorModalProps = {
  handleFriendSelect: (selectedFriend: Friend) => void
  friendsHook: FriendListHook
}

function FriendSelectorModal({ handleFriendSelect, friendsHook }: FriendSelectorModalProps) {
  const { isAddingFriend, setIsAddingFriend, addFriendRef } = useAddFriend()
  const { friendList, selectedFriends } = friendsHook

  function handleNewFriendClick() {
    setIsAddingFriend(true)
    // Give inputbox automatic focus for UX
    // setTimeout(() => {
    //   setNewFocus("printerId")
    // }, 0)
  }

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

      <div className="border-t border-gray-500">
        {isAddingFriend ? (
          <AddNewFriendForm
            setIsAddingFriend={setIsAddingFriend}
            addFriendRef={addFriendRef}
            friendsHook={friendsHook}
          />
        ) : (
          <button
            className="flex items-center w-full px-4 py-2 hover:bg-[#e4d3b2] cursor-pointer bg-[#e8e8e8]"
            onClick={handleNewFriendClick} // Dont change to mouse down!!
          >
            <div className="size-6 bg-[#d4d0c8] border border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center mr-2">
              <Plus size={14} />
            </div>
            <span>Add new toaster...</span>
          </button>
        )}
      </div>
    </div>
  )
}

function useAddFriend() {
  const [isAddingFriend, setIsAddingFriend] = useState(false)
  const addFriendRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (isAddingFriend && addFriendRef.current) {
      requestAnimationFrame(() => {
        addFriendRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      })
    }
  }, [isAddingFriend])
  return { isAddingFriend, setIsAddingFriend, addFriendRef }
}

export default FriendSelectorModal
