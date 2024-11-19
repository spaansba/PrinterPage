"use client"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { EditorContent } from "@tiptap/react"
import { Toolbar } from "./Toolbar"
import AccountPage from "../AccountPage"
import type { Recipient } from "../RecipientSelector"
import RecipientSelector from "../RecipientSelector"
import { PrepareTextToSend } from "../../_helpers/StringToBytes"
import { getAssociatedPrintersById, getUserName, updateLastSendMessage } from "@/lib/queries"
import { useEditorContext } from "@/app/context/editorContext"

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
  .custom-span-class {
    color: yellow !important;
  }
`
export type Lines = { characters: string; characterCount: number }[]

type Pages = "Toaster" | "Account"

const RetroTextEditor = ({ status, setStatus, hTMLContent }: RetroTextEditorProps) => {
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [pageActivated, setPageActivated] = useState<Pages>("Toaster")
  const { user } = useUser()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const { editor, editorForm, getVisualLines } = useEditorContext()

  async function handlePrinterClick() {
    if (!user) {
      return
    }
    setStatus("Sending...")

    const editorElement = editor!.view.dom as HTMLElement
    const lines = getVisualLines(editorElement)
    // Log the lines and their count
    console.log(hTMLContent)
    const htmlContentWithLineBreaks = addLineBreaks(hTMLContent, lines)
    const username = await getUserName(user.id)
    const content = await PrepareTextToSend(htmlContentWithLineBreaks, username)

    if (!selectedRecipient) {
      return
    }

    try {
      const response = await fetch(`https://${selectedRecipient.printerId}.toasttexter.com/print`, {
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

      const responseText = await response.text()
      if (user) {
        await updateLastSendMessage(user.id, selectedRecipient.printerId)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`)
      }
      setStatus("Sent successfully!")
    } catch (error) {
      console.error("Error sending to printer:", error)
      // More detailed error message
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setStatus("Could not connect to printer. It might be unplugged")
      } else {
        // setStatus(`Error: ${error.message}`)
      }
    }

    if (editor) {
      editor.commands.focus()
    }
  }

  function addLineBreaks(htmlContent: string, lines: Lines): string {
    let result = ""
    let insideTag = false
    let insideEntity = false
    let currentLineIndex = 0
    let visibleCharCount = 0
    let nextBreakAt = lines[0]?.characterCount || 0

    const checkAndAddLineBreak = () => {
      if (visibleCharCount === nextBreakAt && currentLineIndex < lines.length - 1) {
        result += "<line-break>"
        currentLineIndex++
        nextBreakAt += lines[currentLineIndex].characterCount
      }
    }

    for (let i = 0; i < htmlContent.length; i++) {
      const char = htmlContent[i]

      if (char === "<") {
        insideTag = true
        result += char
        continue
      }

      if (char === ">") {
        insideTag = false
        result += char
        continue
      }

      if (insideTag) {
        result += char
        continue
      }

      // Regular character - add to result and increment counter
      result += char

      // If we're inside an entity and hit a semicolon, the entity is complete
      if (insideEntity && char === ";") {
        insideEntity = false
        visibleCharCount++
        checkAndAddLineBreak()
        continue
      }

      // Start of an entity
      if (char === "&") {
        insideEntity = true
        continue
      }

      // Only count character if we're not inside an entity
      if (!insideEntity) {
        visibleCharCount++
        checkAndAddLineBreak()
      }
    }

    // Handle any remaining characters at the end
    if (visibleCharCount > 0 && currentLineIndex < lines.length - 1) {
      result += "<line-break>"
    }
    return result
  }

  function updateLineCount() {
    if (!editor?.view?.dom) {
      return { lines: [], count: 0 }
    }
    const lines = getVisualLines(editor.view.dom)
    return {
      lines,
      count: lines.length,
    }
  }

  const Title = () => {
    switch (pageActivated) {
      case "Toaster":
        return "Thermal Toaster"
      case "Account":
        return "User Profile"
      default:
        break
    }
  }

  useEffect(() => {
    const fetchRecipients = async () => {
      if (!user) return
      try {
        const associatedPrinters = await getAssociatedPrintersById(user.id)
        // Transform the data to match the Recipient type
        const formattedRecipients = associatedPrinters.map((printer) => ({
          printerId: printer.printerId,
          name: printer.name,
        }))
        setSelectedRecipient(formattedRecipients[0])
        setRecipients(formattedRecipients)
      } catch (err) {
        console.error("Error fetching recipients:", err)
      }
    }

    fetchRecipients()
  }, [user])

  useEffect(() => {
    if (selectedRecipient) {
      editorForm.setValue("recipient", selectedRecipient)
      editorForm.clearErrors()
    }
  }, [selectedRecipient])

  useEffect(() => {
    if (pageActivated === "Toaster") {
      editorForm.setFocus("textEditorInput")
    }
  }, [pageActivated])

  // Get the first form error message if any exist
  const getFirstFormError = () => {
    if (editorForm.formState.errors.recipient) {
      return editorForm.formState.errors.recipient.message
    }
    if (editorForm.formState.errors.textEditorInput) {
      return editorForm.formState.errors.textEditorInput.message
    }
    return null
  }

  return (
    <>
      <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.1"
              numOctaves="1"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 1" />
            </feComponentTransfer>
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>
      <style>{extraStyles}</style>
      <div className="w-[288px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
        {/* Window Title Bar */}
        <div className="h-6 bg-[#735721] flex items-center justify-between px-2">
          <span className="text-white text-sm font-bold">{Title()}</span>
        </div>

        <div className="h-6 bg-[#d4d0c8] border-t border-[#808080] border-b flex items-center px-2 text-xs gap-[0.7rem]">
          <button
            onClick={() => setPageActivated("Toaster")}
            className={`${pageActivated === "Toaster" ? "underline" : "hover:opacity-80"} `}
          >
            <u>T</u>oaster
          </button>
          <button
            onClick={() => setPageActivated("Account")}
            className={`${pageActivated === "Account" ? "underline" : "hover:opacity-80"} `}
          >
            <u>A</u>ccount
          </button>
        </div>

        {/* Editor Container */}
        {pageActivated === "Toaster" && (
          <div>
            <div>
              <RecipientSelector
                recipients={recipients}
                setRecipients={setRecipients}
                selectedRecipient={selectedRecipient}
                onSelectRecipient={setSelectedRecipient}
              />
              <Toolbar />
              <form className="text-[16px]">
                <div>
                  <EditorContent
                    {...editorForm.register("textEditorInput")}
                    id="editorwrapper"
                    editor={editor}
                    spellCheck="false"
                  />
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
                {(() => {
                  const { lines, count } = updateLineCount()
                  const totalChars = lines.reduce((total, line) => total + line.characterCount, 0)
                  return (
                    <>
                      <span className="pr-4 min-w-[115px]">Characters: {totalChars}</span>
                      <span>Lines: {count}</span>
                    </>
                  )
                })()}
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
                  onClick={editorForm.handleSubmit(handlePrinterClick)}
                  className="w-full h-8 border-t bg-[#e4d3b2] border border-b-transparent border-l-transparent border-r-transparent border-[#808080] hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                >
                  {selectedRecipient?.name
                    ? `Toast ${selectedRecipient?.name}`
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
