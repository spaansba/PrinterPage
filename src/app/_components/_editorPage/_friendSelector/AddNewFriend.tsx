import { Plus } from "lucide-react"
import React from "react"
import AddNewFriendForm from "../AddNewFriendForm"
import { useAddFriend } from "@/app/_customHooks/useAddFriend"
import type { FriendListHook } from "../../AppWindow"

type AddNewFriendProps = {
  friendsHook: FriendListHook
}

function AddNewFriend({ friendsHook }: AddNewFriendProps) {
  const { isAddingFriend, setIsAddingFriend, addFriendRef } = useAddFriend()
  function handleNewFriendClick() {
    setIsAddingFriend(true)
    // Give inputbox automatic focus for UX
    // setTimeout(() => {
    //   setNewFocus("printerId")
    // }, 0)
  }

  return (
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
  )
}

export default AddNewFriend
