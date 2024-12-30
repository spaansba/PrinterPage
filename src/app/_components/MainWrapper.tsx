"use client"
import { useState } from "react"
import { CustomEditorProvider } from "../context/editorContext"
import { SignInButton, useAuth } from "@clerk/nextjs"
import Image from "next/image"
import type { Friend } from "./_editorPage/_friendSelector/FriendSelector"
import AppWindow from "./AppWindow"
import { HtmlContext } from "next/dist/shared/lib/html-context.shared-runtime"

type MainWrapperProps = {
  initialFriendList: Friend[]
}

export type SendStatus = {
  friend: string
  success: boolean
  errorMessage: string
}

export type messageStatus = {
  editorStatus: string
  sendStatus: SendStatus[] | []
}

function MainWrapper({ initialFriendList }: MainWrapperProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const [messageStatus, setMessageStatus] = useState<messageStatus>({
    editorStatus: "",
    sendStatus: [],
  })
  const [hTMLContent, setHTMLContent] = useState("")
  const handleTextChange = (inputText: string, inputHTML: string) => {
    if (inputText.length > 0 && inputHTML != hTMLContent) {
      setMessageStatus({ sendStatus: [], editorStatus: "Editing" })
    }
    if (inputText.length == 0) {
      setMessageStatus((prev) => ({ ...prev, editorStatus: "" }))
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
          messageStatus={messageStatus}
          setMessageStatus={setMessageStatus}
          hTMLContent={hTMLContent}
        />
      </CustomEditorProvider>
    )
  }

  return (
    <SignInButton>
      <div className="w-[288px] p-2 bg-toastPrimary">
        <button className="w-full justify-center flex items-center gap-3 py-2 px-3 bg-toastPrimary border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
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
