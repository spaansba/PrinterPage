import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { getUserName, updatedUserName } from "@/lib/queries"
import { Loader2, Pencil, SendHorizonal, X } from "lucide-react"
import { friendNameSchema } from "../../_editorPage/AddNewFriendForm"

const usernameCache = new Map<string, string>()

function UserName() {
  const { user } = useUser()
  const {
    isLoadingUsername,
    dbUsername,
    setDbUsername,
    isEditingUsername,
    setIsEditingUsername,
    isUpdatingUsername,
    setIsUpdatingUsername,
  } = useUsername()

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
  function handleEditClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation()
    setIsEditingUsername(true)
    resetEdit()
    setTimeout(() => {
      setEditFocus("name")
    }, 0)
  }
  async function handleNewUserName(data: z.infer<typeof friendNameSchema>) {
    if (!user) {
      setErrorEdit("root", { message: "User Doesn't Exist" })
      return
    }

    try {
      setIsUpdatingUsername(true)
      await updatedUserName(user.id, data.name)
      // Update cache when username changes
      usernameCache.set(user.id, data.name)
      setDbUsername(data.name)
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
      <div title="Username" className="text-[16px] font-medium items-center gap-1 min-w-0">
        <div className="font-bold tex-sm">Username:</div>
        {isEditingUsername ? (
          <form className="flex items-center flex-1" onSubmit={handleSubmitEdit(handleNewUserName)}>
            <input
              {...registerEdit("name")}
              className="w-[120px] border-[1px] text-[16px] px-1 py-0.5 rounded"
              defaultValue={dbUsername}
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
                <SendHorizonal size={14} />
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
            <span className="truncate">
              {isLoadingUsername ? <Loader2 className="size-4 animate-spin" /> : dbUsername}
            </span>
            <button title="Edit Username" className="ml-auto" onClick={handleEditClick}>
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
      {errorsEdit.name && <span className="text-red-500 text-sm">{errorsEdit.name.message}</span>}
    </>
  )
}

function useUsername() {
  const { user } = useUser()
  const [isLoadingUsername, setIsLoadingUsername] = useState(false)
  const [dbUsername, setDbUsername] = useState("")
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  useEffect(() => {
    const loadUsername = async () => {
      if (!user) return

      try {
        setIsLoadingUsername(true)

        const cachedUsername = usernameCache.get(user.id)
        if (cachedUsername) {
          setDbUsername(cachedUsername)
          setIsLoadingUsername(false)
          return
        }

        const userName = await getUserName(user.id)
        usernameCache.set(user.id, userName)
        setDbUsername(userName)
      } catch (error) {
        console.error("Error fetching username:", error)
        setDbUsername("Error loading username")
      } finally {
        setIsLoadingUsername(false)
      }
    }

    loadUsername()
  }, [user])
  return {
    isLoadingUsername,
    dbUsername,
    setDbUsername,
    isEditingUsername,
    setIsEditingUsername,
    isUpdatingUsername,
    setIsUpdatingUsername,
  }
}

export default UserName
