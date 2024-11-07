"use client"
import { SignedIn, SignedOut, SignInButton, UserProfile, useUser } from "@clerk/nextjs"
import { Camera, Loader2, Pencil, SendHorizonal, X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { recipientNameSchema } from "./RecipientSelector"
import { getUserName, updatedUserName } from "@/lib/queries"

function AccountPage() {
  const { user } = useUser()
  const [isUploading, setIsUploading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false)
  const [dbUsername, setDbUsername] = useState("")
  const [isLoadingUsername, setIsLoadingUsername] = useState(false)

  useEffect(() => {
    const loadUsername = async () => {
      try {
        if (!user) {
          return
        }
        setIsLoadingUsername(true)
        const userName = await getUserName(user.id)
        setDbUsername(userName)
      } catch (error) {
        console.error("Error fetching username:", error)
        setDbUsername("Error loading username")
      } finally {
        setIsLoadingUsername(false)
      }
    }

    loadUsername()
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return
    const file = e.target.files[0]

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      await user.setProfileImage({ file })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    setError: setErrorEdit,
    setFocus: setEditFocus,
  } = useForm<z.infer<typeof recipientNameSchema>>({
    resolver: zodResolver(recipientNameSchema),
    mode: "onSubmit",
  })

  function handleEditClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation()

    setIsEditingUsername(true)
    resetEdit()

    // Give inputbox automatic focus for UX
    setTimeout(() => {
      setEditFocus("name")
    }, 0)
  }

  async function handleNewUserName(data: z.infer<typeof recipientNameSchema>) {
    if (!user) {
      setErrorEdit("root", { message: "User Doesn't Exist" })
      return
    }

    try {
      setIsUpdatingUsername(true)
      console.log(data.name)
      await updatedUserName(user.id, data.name)
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
      <SignedIn>
        <div className="p-2 border-t border-[1px] border-gray-500 bg-white flex flex-col gap-2 relative">
          <div className="flex gap-2">
            {/* Profile Image */}
            <div
              className="relative size-[5rem] flex-shrink-0 border-[1px] border-[#808080] overflow-hidden bg-gray-100 group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div></div>
              )}

              {/* Upload Overlay */}
              <label
                className={`absolute inset-0 flex flex-col items-center justify-center bg-black/50 cursor-pointer transition-opacity
                ${isHovered || isUploading ? "opacity-100" : "opacity-0"}`}
                htmlFor="profile-image-upload"
              >
                {isUploading ? (
                  <Loader2 className="size-6 text-white animate-spin" />
                ) : (
                  <Camera className="size-6 text-white" />
                )}
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div title="Username" className="text-[16px] font-medium items-center gap-1 min-w-0">
                <div className="font-bold tex-sm">Username:</div>
                {isEditingUsername ? (
                  <form
                    className="flex items-center flex-1"
                    onSubmit={handleSubmitEdit(handleNewUserName)}
                  >
                    <input
                      {...registerEdit("name")}
                      className="w-[120px] border-[1px] px-1 py-0.5 rounded"
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
              {errorsEdit.name && (
                <span className="text-red-500 text-sm">{errorsEdit.name.message}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="min-w-[120px] h-8 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white px-4 text-sm font-bold hover:bg-[#e6e3de]"
          >
            Edit Profile
          </button>
        </div>
        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-2 top-2 z-[60] p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
              <UserProfile routing="hash" path={undefined} />
            </div>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <div className="flex justify-center items-center p-5">
          <SignInButton>
            <button className="min-w-[120px] h-8 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white px-4 text-sm font-bold hover:bg-[#e6e3de]">
              Sign in
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  )
}

export default AccountPage
