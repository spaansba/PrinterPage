import React, { useRef, useState } from "react"
import type { FriendListHook } from "../AppWindow"
import Image from "next/image"
import { Check, Cross, Delete, Pencil, SendHorizonal, Ticket, Trash, Trash2, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { friendNameSchema, type Friend } from "../_editorPage/FriendSelector"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { changeNameAssociatedPrinters } from "@/lib/queries"
import { useUser } from "@clerk/nextjs"
import DeleteFriend from "./DeleteFriend"

type FriendsPageProps = {
  friendsHook: FriendListHook
}

function FriendsPage({ friendsHook }: FriendsPageProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const { user } = useUser()
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

  function handleEditClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, printerId: string) {
    e.stopPropagation()
    resetEdit()
    if (printerId == editingId) {
      setEditingId(null)
    } else {
      setEditingId(printerId)

      setTimeout(() => {
        setEditFocus("name")
      }, 0)
    }
  }

  async function handleNewName(data: z.infer<typeof friendNameSchema>, printerId: string) {
    if (!user) {
      setErrorEdit("root", { message: "User Doesnt Exist" })
      return
    }
    try {
      const changed = await changeNameAssociatedPrinters(user.id, printerId, data.name)
      if (changed.error) {
        console.error(changed.error.message)
        setErrorEdit("root", { message: changed.error.message })
      } else {
        setEditingId(null)
        resetEdit()
        friendsHook.setFriendList((prev) =>
          prev.map((friend: Friend) =>
            friend.printerId === printerId ? { ...friend, name: data.name } : friend
          )
        )
      }
    } catch (error) {
      setErrorEdit("root", { message: "Failed to update name. Please try again." })
      console.error(error)
    }
  }

  return (
    <>
      <div className=" border-t border-[1px] border-gray-500 bg-[#e8e8e8] flex flex-col gap-2 relative">
        {friendsHook.friendList.map((friend, index) => (
          <div
            key={friend.printerId}
            className={`group/friend hover:bg-[#e4d3b2] bg-[#e8e8e8] ${
              index !== friendsHook.friendList.length - 1 ? "border-b border-gray-300" : ""
            }`}
          >
            <div
              className="flex w-full items-center px-4 py-2 cursor-pointer"
              title={`Last send message: ${friend.lastSendMessage.slice(
                0,
                friend.lastSendMessage.length - 4
              )}`}
            >
              <div className="flex items-center justify-center mr-2  rounded-lg p-1">
                <Image src="/images/Logo512BW.png" alt="Toaster" width={34} height={34} />
              </div>
              <div className="flex flex-col">
                {editingId === friend.printerId ? (
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

              {editingId === friend.printerId ? (
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
                  <button type="button" title="Cancel" onClick={() => setEditingId(null)}>
                    <X className="" size={18} />
                  </button>
                </div>
              ) : (
                <div className="ml-auto gap-2 flex">
                  <button
                    type="button"
                    className="ml-auto relative before:absolute before:content-[''] before:-inset-3 before:z-10"
                    title="Edit Name"
                    onClick={(e) => handleEditClick(e, friend.printerId)}
                  >
                    <Pencil className="text-black relative z-20" size={18} />
                  </button>
                  <DeleteFriend friendToDelete={friend.name} />
                </div>
              )}
            </div>

            {editingId === friend.printerId && (
              <div className="text-red-600 pl-[43px] text-[11px]">
                {errorsEdit.name?.message && <p key="id_error">{errorsEdit.name?.message}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default FriendsPage
