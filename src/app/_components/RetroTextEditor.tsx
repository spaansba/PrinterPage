import React, { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react"
import { Square, Minus, X } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserProfile, useUser } from "@clerk/nextjs"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Toolbar } from "./Toolbar"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import TextStyle from "@tiptap/extension-text-style"
import { CustomMark } from "./CustomSpan"
import AccountPage from "./AccountPage"

type RetroTextEditorProps = {
  setTextContent: Dispatch<SetStateAction<string>>
  textContent: string
  setHTMLContent: Dispatch<SetStateAction<string>>
  hTMLContent: string
  setStatus: Dispatch<SetStateAction<string>>
  status: string
}

const extraStyles = `
  .color-white {
    color: #fff9f9d1 !important;
  }
  .custom-span-class{
    color: yellow !important;
  }
`

type Pages = "Printer" | "Account"

const RetroTextEditor = ({
  textContent,
  setTextContent,
  status,
  setStatus,
  hTMLContent,
  setHTMLContent,
}: RetroTextEditorProps) => {
  const [pageActivated, setPageActivated] = useState<Pages>("Printer")
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

  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Underline,
      Highlight.configure({ multicolor: true, HTMLAttributes: { class: "color-white" } }),
      TextStyle,
      CustomMark,
    ],
    content: textEditorValue,
    editorProps: {
      attributes: {
        class:
          "text-[13px] font-mono w-full px-4 py-2 min-h-[200px] bg-white border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none whitespace-pre-wrap",
      },
    },
    onUpdate({ editor }) {
      handleTextChange(editor.getText(), editor.getHTML())
    },
  })

  const handleImageUpload = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // const file = e.target.files[0]
    // if (!file || !user) return
    // try {
    //   setIsUploading(true)
    //   const formData = new FormData()
    //   formData.append("file", file)
    //   // Upload image to Clerk
    //   await user.setProfileImage({ file })
    // } catch (error) {
    //   console.error("Error uploading image:", error)
    // } finally {
    //   setIsUploading(false)
    // }
  }
  return (
    <>
      <style>{extraStyles}</style>
      <div className="w-[31ch] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
        {/* Window Title Bar */}
        <div className="h-6 bg-[#000080] flex items-center justify-between px-2">
          <span className="text-white text-sm font-bold">Thermal Printer</span>
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

        <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] border-b flex items-center px-2 text-xs gap-2">
          <button onClick={() => setPageActivated("Printer")}>
            <u>P</u>rinter
          </button>
          <button onClick={() => setPageActivated("Account")}>
            <u>A</u>ccount
          </button>
        </div>

        {/* Editor Container */}
        {pageActivated === "Printer" && (
          <div>
            <form onSubmit={form.handleSubmit(onSubmit)} onPaste={handlePaste} className="">
              <div>
                <Toolbar editor={editor} />
                <EditorContent editor={editor} spellCheck="false" />
                {form.formState.errors.textEditorInput && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.textEditorInput.message}
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {pageActivated === "Account" && <AccountPage />}

        {/* Status Bar */}
        <div className="h-6 bg-[#d4d0c8] flex items-center px-2 text-xs justify-between">
          <div>
            <span className="pr-4">Characters: {textContent.length}</span>
            <span>Lines: {textContent.split("\n").length}</span>
          </div>
          {status && <span>{status}</span>}
        </div>
      </div>
    </>
  )
}

export default RetroTextEditor
