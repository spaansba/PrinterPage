import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { updatedUserName } from "@/lib/queries"
import { Check, Loader2, SendHorizonal, X } from "lucide-react"
import { useToasterUser } from "@/app/context/userDataContext"
import { friendNameSchema } from "../_editorPage/AddNewFriendForm"

type UsernameProps = {
  isEditingUsername: boolean
  setIsEditingUsername: Dispatch<SetStateAction<boolean>>
}

function Username({ isEditingUsername, setIsEditingUsername }: UsernameProps) {
  const { user } = useUser()
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  const { currentUser, alterUsername } = useToasterUser()
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

  async function handleNewUserName(data: z.infer<typeof friendNameSchema>) {
    if (!user) {
      setErrorEdit("root", { message: "User Doesn't Exist" })
      return
    }

    try {
      setIsUpdatingUsername(true)
      await updatedUserName(user.id, data.name)
      alterUsername(user.id, data.name)
      setIsEditingUsername(false)
    } catch (error) {
      console.error("Error updating username:", error)
      setErrorEdit("name", {
        message: error instanceof Error ? error.message : "Failed to update username",
      })
    } finally {
      setIsUpdatingUsername(false)
    }
  }
  return (
    <>
      <div title="Username" className="items-center gap-1 min-w-0">
        {isEditingUsername ? (
          <form className="flex items-center flex-1" onSubmit={handleSubmitEdit(handleNewUserName)}>
            <input
              {...registerEdit("name")}
              className="w-[100px] border-[1px]  px-1 py-0.5 rounded"
              defaultValue={currentUser.username}
              placeholder="Enter username"
            />
            <button
              type="submit"
              title="Save Username"
              className="ml-2 disabled:opacity-50"
              disabled={isUpdatingUsername}
            >
              {isUpdatingUsername ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
            </button>
            <button
              type="button"
              title="Cancel"
              className="ml-2"
              onClick={() => setIsEditingUsername(false)}
            >
              <X size={14} />
            </button>
          </form>
        ) : (
          <div className="flex">
            <span className="truncate">{currentUser.username}</span>
          </div>
        )}
      </div>
      {errorsEdit.name && (
        <span className="text-toastError text-sm">{errorsEdit.name.message}</span>
      )}
    </>
  )
}

export default Username
