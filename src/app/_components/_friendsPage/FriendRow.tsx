import { zodResolver } from "@hookform/resolvers/zod"
import React, { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { friendNameSchema } from "../_editorPage/AddNewFriendForm"
import { useUser } from "@clerk/nextjs"
import type { FriendListHook } from "../AppWindow"
import type { Friend } from "@/app/types/printer"
import FriendProfilePicture from "../_profilePicture/FriendProfilePicture"
import { Check, Edit, Trash2, X } from "lucide-react"
import { MenuModal, type MenuOption } from "../_helperComponents/MenuModal"
import DeleteModal from "../_helperComponents/DeleteModal"

type FriendRowProps = {
  friendsHook: FriendListHook
  friend: Friend
}

function FriendRow({ friendsHook, friend }: FriendRowProps) {
  const { user } = useUser()
  const [isEditingName, setIsEditingName] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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

  const menuOptions: MenuOption[] = [
    {
      label: "Edit Name",
      icon: <Edit className="size-4" />,
      onClick: () => {
        setIsEditingName(true)
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-4" />,
      onClick: () => {
        setShowDeleteModal(true)
      },
      className: "text-toastError",
    },
  ]

  return (
    <>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleOnDeleteClick={() => friendsHook.deleteFriend(user!.id, friend)}
        messageText={`Are you sure you want to delete ${friend.name}`}
        titleText="Confirm Deletion of Friend"
      />
      <div
        key={friend.printerId}
        className={`group/friend  bg-toastWhite [&:not(:last-child)]:border-b [&:not(:last-child)]:border-gray-300`}
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
              <MenuModal isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} options={menuOptions} />
            </div>
          )}
        </div>

        {isEditingName && (
          <div className="text-toastError pl-[43px] text-[11px]">
            {errorsEdit.name?.message && <p key="id_error">{errorsEdit.name?.message}</p>}
          </div>
        )}
      </div>
    </>
  )
}

export default FriendRow
