"use client"
import { useState } from "react"
import RetroTextEditor from "./_components/_editor/RetroTextEditor"
import { CustomEditorProvider, useEditorContext } from "./context/editorContext"

export default function Home() {
  const [status, setStatus] = useState("")
  const [textContent, setTextContent] = useState("")
  const [hTMLContent, setHTMLContent] = useState("")

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
        <RetroTextEditor
          setTextContent={setTextContent}
          textContent={textContent}
          status={status}
          setStatus={setStatus}
          setHTMLContent={setHTMLContent}
          hTMLContent={hTMLContent}
        />
      </CustomEditorProvider>
    </div>
  )
}
