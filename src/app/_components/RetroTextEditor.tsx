"use client"
import React, { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { Square, Minus, X } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Toolbar } from "./Toolbar"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import TextStyle from "@tiptap/extension-text-style"
import { CustomMark } from "../_helpers/CustomSpan"
import AccountPage from "./AccountPage"
import type { Recipient } from "./RecipientSelector"
import RecipientSelector from "./RecipientSelector"
import { htmlContentToBytesWithCommands } from "../_helpers/StringToBytes"

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
const xxx = "fcs2ean4kg"

type Pages = "Printer" | "Account"

const RetroTextEditor = ({
  textContent,
  setTextContent,
  status,
  setStatus,
  hTMLContent,
  setHTMLContent,
}: RetroTextEditorProps) => {
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [pageActivated, setPageActivated] = useState<Pages>("Printer")
  const Title = () => {
    switch (pageActivated) {
      case "Printer":
        return "Thermal Printer"
      case "Account":
        return "User Profile"
      default:
        break
    }
  }

  useEffect(() => {
    if (selectedRecipient) {
      form.setValue("recipient", selectedRecipient)
      form.clearErrors()
    }
  }, [selectedRecipient])

  const formSchema = z.object({
    textEditorInput: z
      .string()
      .min(4, { message: "Message is a bit on the short side" })
      .max(300, { message: "Message is a bit on the long side" }), //TODO: Max lines instead of chars based on word wrap
    recipient: z
      .object(
        {
          id: z.string(),
          username: z.string(),
        },
        {
          required_error: "Please select a recipient",
          invalid_type_error: "Please select a recipient",
        }
      )
      .nullable()
      .refine((val) => val !== null, {
        message: "Please select a recipient",
      }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      textEditorInput: "",
      recipient: undefined,
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
    immediatelyRender: false,
    content: textEditorValue,
    editorProps: {
      attributes: {
        class:
          "text-[13px] font-mono w-full px-4 py-2 min-h-[200px] bg-white border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none whitespace-pre-wrap",
      },
    },
    onUpdate({ editor }) {
      handleTextChange(editor.getText(), editor.getHTML())
      form.clearErrors()
    },
  })

  async function handlePrinterClick() {
    setStatus("Sending...")
    const content = await htmlContentToBytesWithCommands(hTMLContent)
    if (!selectedRecipient) {
      return
    }
    try {
      const response = await fetch(`https://${selectedRecipient.id}.toasttexter.com/print`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add CORS headers if needed
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: Array.from(content),
        }),
      })

      // Log the response for debugging
      console.log("Response status:", response.status)
      const responseText = await response.text()
      console.log("Response body:", responseText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`)
      }
      setStatus("Sent successfully!")
    } catch (error) {
      console.error("Error sending to printer:", error)
      // More detailed error message
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setStatus("Could not connect to printer. Please check if it's online.")
      } else {
        // setStatus(`Error: ${error.message}`)
      }
    }

    if (editor) {
      editor.commands.focus()
    }
  }

  // Get the first form error message if any exist
  const getFirstFormError = () => {
    if (form.formState.errors.recipient) {
      console.log(form.formState.errors.recipient.message)
      return form.formState.errors.recipient.message
    }
    if (form.formState.errors.textEditorInput) {
      return form.formState.errors.textEditorInput.message
    }
    return null
  }

  return (
    <>
      <style>{extraStyles}</style>
      <div className="w-[300px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
        {/* Window Title Bar */}
        <div className="h-6 bg-[#735721] flex items-center justify-between px-2">
          <span className="text-white text-sm font-bold">{Title()}</span>
        </div>

        <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] border-b flex items-center px-2 text-xs gap-2">
          <button
            onClick={() => setPageActivated("Printer")}
            className={`${pageActivated === "Printer" ? "underline" : "hover:opacity-80"} `}
          >
            <u>P</u>rinter
          </button>
          <button
            onClick={() => setPageActivated("Account")}
            className={`${pageActivated === "Account" ? "underline" : "hover:opacity-80"} `}
          >
            <u>A</u>ccount
          </button>
        </div>

        {/* Editor Container */}
        {pageActivated === "Printer" && (
          <div>
            <div>
              <RecipientSelector
                selectedRecipient={selectedRecipient}
                onSelectRecipient={setSelectedRecipient}
              />
              <Toolbar editor={editor} />
              <form onPaste={handlePaste} className="text-[16px]">
                <div className="text-[13px]">
                  <EditorContent editor={editor} spellCheck="false" />
                  {getFirstFormError() && (
                    <div className="bg-[#d4d0c8] border-t border-[#808080] px-2 py-1">
                      <span className="text-red-500 text-xs">{getFirstFormError()}</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
            {/* Status Bar */}
            <div className="bg-[#d4d0c8] flex items-center px-2 text-xs justify-between py-1 text-[11px]">
              <div className="flex flex-col">
                <span className="pr-4 min-w-[115px]">Characters: {textContent.length}</span>
                <span>Lines: {textContent.split("\n").length}</span>
              </div>
              {status && <span>{status}</span>}
            </div>
            <div className="">
              <SignedOut>
                <SignInButton>
                  <button className="w-full h-8 border-t bg-[#c9af7c] border border-b-transparent border-l-transparent border-r-transparent border-[#808080] hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white">
                    Sign in to send prints
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={form.handleSubmit(handlePrinterClick)}
                  className="w-full h-8 border-t bg-[#e4d3b2] border border-b-transparent border-l-transparent border-r-transparent border-[#808080] hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                >
                  {selectedRecipient?.username
                    ? `Send to ${selectedRecipient?.username}`
                    : "Choose Recipient"}
                </button>
              </SignedIn>
            </div>
          </div>
        )}

        {pageActivated === "Account" && <AccountPage />}
      </div>
    </>
  )
}

export default RetroTextEditor
