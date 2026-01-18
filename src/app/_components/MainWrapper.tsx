"use client"
import React, { useState } from "react"
import { CustomEditorProvider } from "../context/editorContext"
import { useAuth } from "@clerk/nextjs"
import AppWindow from "./AppWindow"
import NotSignedInPage from "./NotSignedInPage"
import { testWeatherPrint } from "../_actions/testWeather"

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

  const handleWeatherTest = async () => {
    const result = await testWeatherPrint("amsterdam")
    if (result.success && result.dataUrl) {
      navigator.clipboard
        .writeText(result.dataUrl)
        .then(() => console.log("Data URL copied to clipboard"))
        .catch((err) => console.error("Failed to copy:", err))
    } else {
      console.error("Weather test failed:", result.error)
    }
  }

  if (!isLoaded) return null

  if (isSignedIn) {
    return (
      <div className="flex flex-col items-center w-full">
        <CustomEditorProvider handleTextChange={handleTextChange}>
          <AppWindow
            messageStatus={messageStatus}
            setMessageStatus={setMessageStatus}
            hTMLContent={hTMLContent}
          />
        </CustomEditorProvider>
        <button
          className="my-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleWeatherTest}
        >
          Test Weather Print
        </button>
      </div>
    )
  }

  return <NotSignedInPage />
}

export default MainWrapper
