"use client"
import { useState } from "react"
import { CustomEditorProvider } from "../context/editorContext"
import AccountPage from "./_accountPage/AccountPage"
import EditorPage from "./_editorPage/EditorPage"
import TitleBar, { type Pages } from "./TitleBar"
import { SignInButton, useAuth } from "@clerk/nextjs"
import Image from "next/image"
import FriendsPage from "./_friendsPage/FriendsPage"

function MainWrapper() {
  const { isLoaded, isSignedIn } = useAuth()
  const [status, setStatus] = useState("")
  const [hTMLContent, setHTMLContent] = useState("")
  const [pageActivated, setPageActivated] = useState<Pages>("Toaster")

  const handleTextChange = (inputText: string, inputHTML: string) => {
    if (inputText.length > 0) {
      setStatus("Editing")
    }
    setHTMLContent(inputHTML)
  }

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return (
      <CustomEditorProvider handleTextChange={handleTextChange}>
        <div className="w-[288px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
          <TitleBar pageActivated={pageActivated} setPageActivated={setPageActivated} />
          {pageActivated === "Toaster" && (
            <EditorPage status={status} setStatus={setStatus} hTMLContent={hTMLContent} />
          )}
          {pageActivated === "Account" && <AccountPage />}
          {pageActivated === "Friends" && <FriendsPage />}
        </div>
      </CustomEditorProvider>
    )
  }

  return (
    <SignInButton>
      <div className="w-[288px] p-2 bg-[#d4d0c8]">
        <button className="w-full justify-center flex items-center gap-3 py-2 px-3 bg-[#d4d0c8] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
          <div className="w-8 h-8 relative">
            <Image src="/images/Logo512.png" alt="Toaster" fill className="object-contain" />
          </div>
          <span className="font-sans text-black text-base">Login to Toaster</span>
        </button>
      </div>
    </SignInButton>
  )
}

export default MainWrapper
