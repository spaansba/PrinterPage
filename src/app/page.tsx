"use client"
import { useState } from "react"
import { CustomEditorProvider, useEditorContext } from "./context/editorContext"
import TitleBar, { type Pages } from "./_components/TitleBar"
import AccountPage from "./_components/_accountPage/AccountPage"
import ToasterPage from "./_components/_editorPage/EditorPage"

export default function Home() {
  const [status, setStatus] = useState("")
  const [textContent, setTextContent] = useState("")
  const [hTMLContent, setHTMLContent] = useState("")
  const [pageActivated, setPageActivated] = useState<Pages>("Toaster")
  const handleTextChange = (inputText: string, inputHTML: string) => {
    if (inputText.length > 0) {
      setStatus("Editing")
    }
    setTextContent(inputText)
    setHTMLContent(inputHTML)
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 gap-6 font-mono text-black bg-[#d4d0c8]">
      <CustomEditorProvider handleTextChange={handleTextChange}>
        <div className="w-[288px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
          <TitleBar pageActivated={pageActivated} setPageActivated={setPageActivated} />
          {pageActivated === "Toaster" && (
            <ToasterPage status={status} setStatus={setStatus} hTMLContent={hTMLContent} />
          )}
          {pageActivated === "Account" && <AccountPage />}
        </div>
      </CustomEditorProvider>
    </div>
  )
}
