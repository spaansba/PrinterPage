"use client"
import React, { useEffect, useRef, useState } from "react"
import { ChevronDown, Plus, Circle, CircleCheckBig, CircleMinus } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUser } from "@clerk/nextjs"
import { addAssociatedPrinters } from "@/lib/queries"
import Image from "next/image"
import { useDropDownModal } from "../../_customHooks/useDropdownModal"
import type { FriendListHook } from "../AppWindow"

export type Friend = {
  printerId: string
  name: string
  lastSendMessage: string
}

export const friendNameSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name is too short (min 3)" })
    .max(20, { message: "Name is too long (max 20)" }),
})

const newFriendSchema = z.object({
  printerId: z
    .string()
    .min(10, { message: "Should be 10 characters long" })
    .max(10, { message: "Should be 10 characters long" }),
  name: friendNameSchema.shape.name,
})

type FriendSelectorProps = {
  friendsHook: FriendListHook
}

const FriendSelector = ({ friendsHook }: FriendSelectorProps) => {
  const { user } = useUser()
  const [editingId, setEditingId] = useState<string | null>(null)
  const { friendList, selectedFriends, setFriendList, setSelectedFriends } = friendsHook
  const { isAddingFriend, setIsAddingFriend, addFriendRef } = useAddFriend()

  const { toggleButtonRef, dropdownRef, isDropdownOpen, setIsDropdownOpen } = useDropDownModal(
    () => {
      setIsDropdownOpen(false)
      setIsAddingFriend(false)
      setEditingId(null)
    },
    false
  )

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    formState: { errors: errorsNew },
    reset: resetNew,
    setError: setErrorNew,
    setFocus: setNewFocus,
  } = useForm<z.infer<typeof newFriendSchema>>({
    resolver: zodResolver(newFriendSchema),
    mode: "onSubmit",
  })

  async function handleFormSubmit(data: z.infer<typeof newFriendSchema>) {
    if (!user) {
      setErrorNew("root", { message: "User Doesnt Exist" })
      return
    }
    try {
      const added = await addAssociatedPrinters(user.id, data.printerId, data.name)
      if (added.error) {
        setErrorNew("root", { message: added.error.message })
      } else {
        resetNew()
        const newFriend: Friend = {
          printerId: added.data.printerId,
          name: added.data.name,
          lastSendMessage: new Date().toISOString(),
        }
        setFriendList((prev) => [...prev, newFriend])
        setIsAddingFriend(false)
        setSelectedFriends([newFriend])
      }
    } catch (error) {
      setErrorNew("root", {
        message: "Failed to add toaster. Please try again.",
      })
      console.error(error)
    }
  }

  function handleNewFriendClick() {
    setIsAddingFriend(true)
    // Give inputbox automatic focus for UX
    setTimeout(() => {
      setNewFocus("printerId")
    }, 0)
  }

  function handleSelect(selectedFriend: Friend) {
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

  const FriendItem = ({ friend }: { friend: Friend }) => {
    const isSelected = selectedFriends?.includes(friend)
    return (
      <div
        className={`group/friend lg:hover:bg-[#e4d3b2] ${
          isSelected ? "bg-[#e4d3b2]" : "bg-[#e8e8e8]"
        } `}
      >
        <div
          onClick={() => handleSelect(friend)}
          className="flex w-full items-center px-4 py-2 lg:hover:bg-[#e4d3b2] cursor-pointer"
          title={`Toaster ID: ${friend.printerId}`}
        >
          <div className="flex items-center justify-center mr-2">
            <Image src="/images/Logo512BW.png" alt="Toaster" width={24} height={24} />
          </div>
          <div className="flex flex-col">
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
  const maxVisibleRecipients = 5
  return (
    <div className="relative w-full text-[13px] font-mono">
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full min-h-[40px] px-4 py-2 bg-[#e8e8e8] border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] cursor-pointer flex items-start justify-between"
      >
        <div className="flex flex-wrap items-start overflow-hidden w-[90%] gap-y-[0.4rem] gap-x-3">
          {selectedFriends.length > 0 ? (
            <>
              {selectedFriends.slice(0, maxVisibleRecipients).map((friend, index) => (
                <div key={friend.printerId} className="inline-flex items-center">
                  <Image
                    src="/images/Logo512BW.png"
                    alt="Toaster"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  <span className="whitespace-nowrap">{friend.name}</span>
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
      </button>
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute w-[110%] -translate-x-[5%] mt-1 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]  bg-[#e8e8e8] border border-gray-500 z-10"
        >
          <div className="max-h-[30rem] overflow-y-auto">
            {friendList.map((friend) => (
              <FriendItem key={friend.printerId} friend={friend} />
            ))}

            <div className="border-t border-gray-500">
              {isAddingFriend ? (
                <form
                  ref={addFriendRef}
                  className="flex flex-col px-4 py-2 gap-1"
                  onSubmit={handleSubmitNew(handleFormSubmit)}
                >
                  <div className="grid grid-cols-2">
                    <label htmlFor="printerId" className="content-center">
                      Toaster ID:
                    </label>
                    <input
                      {...registerNew("printerId", {
                        onChange: (e) => {
                          e.target.value = e.target.value.toLowerCase()
                        },
                      })}
                      placeholder="xxxxxxxxxx"
                      className="border-solid border border-gray-300 px-2 text-[16px] py-1 rounded"
                      id="printerId"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <div className="col-span-2 text-red-600 pt-1">
                      {errorsNew.printerId?.message && (
                        <p key="id_error">{errorsNew.printerId?.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2">
                    <label htmlFor="name" className="content-center">
                      Toaster Name:
                    </label>

                    <input
                      {...registerNew("name")}
                      id="name"
                      placeholder="Name"
                      className="border-solid border border-gray-300 text-[16px] px-2 py-1 rounded"
                    />
                    <div className="col-span-2 text-red-600 pt-1">
                      {errorsNew.name?.message && <p key="name_error">{errorsNew.name?.message}</p>}
                    </div>
                  </div>
                  <div className="text-red-600 pt-1">
                    {errorsNew.root?.message && <p key="root_error">{errorsNew.root?.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="flex justify-center bg-[#735721] hover:bg-[#e4d3b2] text-white  py-[6px]"
                  >
                    <Plus />
                  </button>
                </form>
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
        </div>
      )}
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

export default FriendSelector
