import { addAssociatedPrinters } from "@/lib/queries"
import { useUser } from "@clerk/nextjs"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import React, { type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Friend } from "./_friendSelector/FriendSelector"
import type { FriendListHook } from "../AppWindow"

export const friendNameSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name is too short (min 3)" })
    .max(20, { message: "Name is too long (max 20)" }),
})

export const printerIdSchema = z.object({
  printerId: z
    .string()
    .min(10, { message: "Should be 10 characters long" })
    .max(10, { message: "Should be 10 characters long" }),
  name: friendNameSchema.shape.name,
})

type AddNewFriendFormProps = {
  setIsAddingFriend: Dispatch<SetStateAction<boolean>>
  addFriendRef: React.RefObject<HTMLFormElement>
  friendsHook: FriendListHook
}

function AddNewFriendForm({ friendsHook, setIsAddingFriend, addFriendRef }: AddNewFriendFormProps) {
  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    formState: { errors: errorsNew },
    reset: resetNew,
    setError: setErrorNew,
  } = useForm<z.infer<typeof printerIdSchema>>({
    resolver: zodResolver(printerIdSchema),
    mode: "onSubmit",
  })
  const { user } = useUser()
  async function handleFormSubmit(data: z.infer<typeof printerIdSchema>) {
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
        friendsHook.setFriendList((prev) => [...prev, newFriend])
        setIsAddingFriend(false)
        friendsHook.setSelectedFriends([newFriend])
      }
    } catch (error) {
      setErrorNew("root", {
        message: "Failed to add toaster. Please try again.",
      })
      console.error(error)
    }
  }
  return (
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
          {errorsNew.printerId?.message && <p key="id_error">{errorsNew.printerId?.message}</p>}
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
        className="flex justify-center bg-toastTertiary hover:bg-toastPrimaryHover text-white  py-[6px]"
      >
        <Plus />
      </button>
    </form>
  )
}

export default AddNewFriendForm
