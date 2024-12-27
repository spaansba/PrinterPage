"use client"
import { useState } from "react"
import { CustomEditorProvider } from "../context/editorContext"
import { SignInButton, useAuth } from "@clerk/nextjs"
import Image from "next/image"
import type { Friend } from "./_editorPage/FriendSelector"
import AppWindow from "./AppWindow"

type MainWrapperProps = {
  initialFriendList: Friend[]
}

function MainWrapper({ initialFriendList }: MainWrapperProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const [status, setStatus] = useState("")
  const [hTMLContent, setHTMLContent] = useState("")
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
        <AppWindow
          initialFriendList={initialFriendList}
          status={status}
          setStatus={setStatus}
          hTMLContent={hTMLContent}
        />
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
