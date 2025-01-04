"use client"
import { useState } from "react"
import { CustomEditorProvider } from "../context/editorContext"
import { SignInButton, useAuth } from "@clerk/nextjs"
import Image from "next/image"
import AppWindow from "./AppWindow"
import NotSignedInPage from "./NotSignedInPage"

export type SendStatus = {
  friend: string
  success: boolean
  errorMessage: string
}

export type messageStatus = {
  editorStatus: string
  sendStatus: SendStatus[] | []
}

function MainWrapper() {
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
          messageStatus={messageStatus}
          setMessageStatus={setMessageStatus}
          hTMLContent={hTMLContent}
        />
      </CustomEditorProvider>
    )
  }

  return <NotSignedInPage />
}

export default MainWrapper
