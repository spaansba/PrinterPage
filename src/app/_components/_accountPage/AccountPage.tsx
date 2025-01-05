"use client"
import { UserProfile } from "@clerk/nextjs"
import React, { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useToasterUser } from "@/app/context/userDataContext"
import AccountInformation from "./AccountInformation"

function AccountPage() {
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  const { user } = useUser()
  const { currentUser } = useToasterUser()
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditProfileModalOpen(false)
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])
  if (!user || currentUser.id != user.id) {
    return null
  }

  return (
    <div className=" bg-toastWhite">
      <div className="p-3">
        <AccountInformation setIsEditProfileModalOpen={setIsEditProfileModalOpen} />
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="relative bg-[#c0c0c0] border-2 border-white">
            <button
              onClick={() => setIsEditProfileModalOpen(false)}
              className="absolute right-1 top-1 z-[60] p-1 text-sm"
            >
              ✕
            </button>
            <UserProfile routing="hash" path={undefined} />
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountPage
