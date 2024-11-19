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
      {/* Main Editor Window */}
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
      {/* Print Button */}

      {/* Sample Text Box */}
      {/* <div className="w-[600px] bg-white border-2 border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] p-4 text-sm">
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting, remaining essentially
          unchanged.
        </p>
      </div> */}
    </div>
  )
}
