import { zodResolver } from "@hookform/resolvers/zod"
import React, { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { friendNameSchema } from "../_editorPage/AddNewFriendForm"
import { useUser } from "@clerk/nextjs"
import type { FriendListHook } from "../AppWindow"
import type { Friend } from "@/app/types/printer"
import FriendProfilePicture from "../_profilePicture/FriendProfilePicture"
import { Check, Pencil, X } from "lucide-react"
import DeleteFriend from "./DeleteFriend"

type FriendRowProps = {
  friendsHook: FriendListHook
  friend: Friend
}

function FriendRow({ friendsHook, friend }: FriendRowProps) {
  const { user } = useUser()
  const [isEditingName, setIsEditingName] = useState(false)
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setError: setErrorEdit,
    setFocus: setEditFocus,
  } = useForm<z.infer<typeof friendNameSchema>>({
    resolver: zodResolver(friendNameSchema),
    mode: "onSubmit",
  })
  const editNameFormRef = useRef<HTMLFormElement>(null)

  async function handleNewName(data: z.infer<typeof friendNameSchema>, printerId: string) {
    if (!user) {
      setErrorEdit("root", { message: "Failed to update name. Please try again." })
      return
    }
    const result = await friendsHook.changeFriendName(user.id, data, printerId)
    if (result.success) {
      resetEdit()
      setIsEditingName(false)
    } else {
      setErrorEdit("root", { message: result.errorMessage })
    }
  }

  return (
    <div
      key={friend.printerId}
      className={`group/friend md:hover:bg-toastPrimaryHover bg-toastWhite ${
        friendsHook.friendList.length - 1 ? "border-b border-gray-300" : ""
      }`}
    >
      <div
        className="flex w-full items-center px-2 py-2 cursor-pointer"
        title={`Last send Toast: ${friend.lastSendMessage.slice(
          0,
          friend.lastSendMessage.length - 4
        )}`}
      >
        <div className="flex items-center justify-center mr-2 rounded-lg p-1">
          <FriendProfilePicture
            pictureUrl={friend.profilePicture}
            altName={friend.name}
            pictureSizeInPX={40}
          />
        </div>
        <div className="flex flex-col">
          {isEditingName ? (
            <form
              ref={editNameFormRef}
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmitEdit((data) => handleNewName(data, friend.printerId))(e)
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center text-[16px]">
                <input
                  {...registerEdit("name")}
                  className="border-2 w-[145px] px-2 py-1 rounded0 font-mono"
                  autoComplete="off"
                  spellCheck="false"
                  defaultValue={friend.name}
                />
              </div>
            </form>
          ) : (
            <div className="flex flex-col">
              <span className="text-[1rem] ">{friend.name}</span>
              <span className="text-[0.7rem]">{friend.printerId}</span>
            </div>
          )}
        </div>

        {isEditingName ? (
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              title="Confirm Name"
              onClick={(e) => {
                e.stopPropagation()
                editNameFormRef.current?.requestSubmit()
              }}
            >
              <Check className="" size={18} />
            </button>
            <button
              type="button"
              title="Cancel"
              onClick={() => {
                setIsEditingName(false)
              }}
            >
              <X className="" size={18} />
            </button>
          </div>
        ) : (
          <div className="ml-auto gap-2 flex">
            <button
              type="button"
              className="ml-auto relative before:absolute before:content-[''] before:-inset-3 before:z-10"
              title="Edit Name"
              onClick={() => {
                setIsEditingName(true)
              }}
            >
              <Pencil className="text-black relative z-20" size={18} />
            </button>
            <DeleteFriend friendToDelete={friend} deleteFriend={friendsHook.deleteFriend} />
          </div>
        )}
      </div>

      {isEditingName && (
        <div className="text-red-600 pl-[43px] text-[11px]">
          {errorsEdit.name?.message && <p key="id_error">{errorsEdit.name?.message}</p>}
        </div>
      )}
    </div>
  )
}

export default FriendRow
