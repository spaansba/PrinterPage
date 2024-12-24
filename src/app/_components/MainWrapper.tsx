"use client"
import { useState } from "react"
import { CustomEditorProvider } from "../context/editorContext"
import AccountPage from "./_accountPage/AccountPage"
import EditorPage from "./_editorPage/EditorPage"
import TitleBar, { type Pages } from "./TitleBar"

function MainWrapper() {
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
    <>
      <CustomEditorProvider handleTextChange={handleTextChange}>
        <div className="w-[288px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
          <TitleBar pageActivated={pageActivated} setPageActivated={setPageActivated} />
          {pageActivated === "Toaster" && (
            <EditorPage status={status} setStatus={setStatus} hTMLContent={hTMLContent} />
          )}
          {pageActivated === "Account" && <AccountPage />}
        </div>
      </CustomEditorProvider>
    </>
  )
}

export default MainWrapper
