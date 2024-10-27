import React, { type Dispatch, type SetStateAction, useEffect, useRef } from "react"
import { Square, Minus, X } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Tiptap from "./Tiptap"

type RetroTextEditorProps = {
  setTextContent: Dispatch<SetStateAction<string>>
  textContent: string
  setHTMLContent: Dispatch<SetStateAction<string>>
  hTMLContent: string
  setStatus: Dispatch<SetStateAction<string>>
  status: string
}

const RetroTextEditor = ({
  textContent,
  setTextContent,
  status,
  setStatus,
  hTMLContent,
  setHTMLContent,
}: RetroTextEditorProps) => {
  const formSchema = z.object({
    textEditorInput: z.string().min(1, { message: "too short" }).max(300, { message: "too long" }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      textEditorInput: "",
    },
  })

  const textEditorValue = form.watch("textEditorInput")
  const handleTextChange = (inputText: string, inputHTML: string) => {
    setStatus("Editing")
    console.log(inputText)
    console.log(inputHTML)
    setTextContent(inputText)
    setHTMLContent(inputHTML)
    form.setValue("textEditorInput", inputText)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLFormElement>) => {
    e.preventDefault()
    document.execCommand("inserttext", false, e.clipboardData.getData("text/plain"))
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <div className="w-[31ch] border-2 border-white shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
      {/* Window Title Bar */}
      <div className="h-6 bg-[#000080] flex items-center justify-between px-2">
        <span className="text-white text-sm font-bold">Retro Text Editor</span>
        <div className="flex gap-1">
          <button className="w-4 h-4 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center">
            <Minus size={12} />
          </button>
          <button className="w-4 h-4 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center">
            <Square size={12} />
          </button>
          <button className="w-4 h-4 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] flex items-center justify-center">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="border border-[#808080]">
        <form onSubmit={form.handleSubmit(onSubmit)} onPaste={handlePaste} className="">
          <div>
            <Tiptap textEditorInput={textEditorValue} onChange={handleTextChange} />
            {form.formState.errors.textEditorInput && (
              <span className="text-red-500 text-xs">
                {form.formState.errors.textEditorInput.message}
              </span>
            )}
          </div>
        </form>

        {/* Status Bar */}
        <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] flex items-center px-2 text-xs justify-between">
          <div>
            <span className="pr-4">Characters: {textContent.length}</span>
            <span>Lines: {textContent.split("\n").length}</span>
          </div>
          {status && <span>{status}</span>}
        </div>
      </div>
    </div>
  )
}

export default RetroTextEditor
