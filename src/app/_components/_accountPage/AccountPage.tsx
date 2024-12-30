"use client"
import { SignOutButton, UserProfile } from "@clerk/nextjs"
import { X } from "lucide-react"
import React, { useEffect, useState } from "react"
import UserInformation from "./_userInformation/UserInformation"

function AccountPage() {
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditProfileModalOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  return (
    <>
      <div className="p-2 border-t border-[1px] border-gray-500 bg-white flex flex-col gap-2 relative">
        <UserInformation />
        <div className="grid  grid-cols-2 grid-rows-1 gap-1">
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className=" h-8 bg-toastPrimary border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white px-4 text-sm font-bold hover:bg-[#e6e3de]"
          >
            Edit
          </button>
          <SignOutButton>
            <button className=" h-8 bg-toastPrimary border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white px-4 text-sm font-bold hover:bg-[#e6e3de]">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>

      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="relative">
            <button
              onClick={() => setIsEditProfileModalOpen(false)}
              className="absolute right-2 top-2 z-[60] p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
            <UserProfile routing="hash" path={undefined} />
          </div>
        </div>
      )}
    </>
  )
}

export default AccountPage
