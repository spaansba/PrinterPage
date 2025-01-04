"use client"
import React, { useState } from "react"

import { useDropDownModal } from "../../../_customHooks/useDropdownModal"
import type { FriendListHook } from "../../AppWindow"
import SelectedToastersView from "./SelectedToastersView"
import FriendSelectorModal from "./FriendSelectorModal"

type FriendSelectorProps = {
  friendsHook: FriendListHook
}

const FriendSelector = ({ friendsHook }: FriendSelectorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const { selectedFriends, setSelectedFriends } = friendsHook
  const { toggleButtonRef, dropdownRef, isDropdownOpen, setIsDropdownOpen } = useDropDownModal(
    () => {
      setIsDropdownOpen(false)
      // setIsAddingFriend(false)
      setEditingId(null)
    },
    false
  )

  function handleFriendSelect(selectedFriend: Friend) {
    if (selectedFriend.printerId == editingId) {
      return
    }
    // add if not present, remove if present
    setSelectedFriends(
      selectedFriends.some((friend) => friend.printerId === selectedFriend.printerId)
        ? selectedFriends.filter((friend) => friend.printerId !== selectedFriend.printerId)
        : [...selectedFriends, selectedFriend]
    )
  }

  return (
    <div className="relative w-full text-[13px] font-mono">
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full min-h-[50px] px-4 py-2 bg-toastWhite border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] cursor-pointer flex items-center justify-between"
      >
        <SelectedToastersView selectedFriends={selectedFriends} isDropdownOpen={isDropdownOpen} />
      </button>
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute w-[110%] -translate-x-[5%] mt-1 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]  bg-toastWhite border border-gray-500 z-10"
        >
          <FriendSelectorModal handleFriendSelect={handleFriendSelect} friendsHook={friendsHook} />
        </div>
      )}
    </div>
  )
}

export default FriendSelector
