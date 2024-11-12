"use client"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { Editor, EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Toolbar } from "./Toolbar"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import TextStyle from "@tiptap/extension-text-style"
import { CustomMark } from "../../_helpers/CustomSpan"
import AccountPage from "../AccountPage"
import type { Recipient } from "../RecipientSelector"
import RecipientSelector from "../RecipientSelector"
import { htmlContentToBytesWithCommands } from "../../_helpers/StringToBytes"
import { getAssociatedPrintersById, getUserName, updateLastSendMessage } from "@/lib/queries"
import Image from "@tiptap/extension-image"

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
type Lines = { characters: string; characterCount: number }[]

type Pages = "Printer" | "Account"

const RetroTextEditor = ({
  setTextContent,
  status,
  setStatus,
  hTMLContent,
  setHTMLContent,
}: RetroTextEditorProps) => {
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [pageActivated, setPageActivated] = useState<Pages>("Printer")
  const { user } = useUser()
  const [recipients, setRecipients] = useState<Recipient[]>([])

  async function handlePrinterClick() {
    if (!user) {
      return
    }
    setStatus("Sending...")

    const editorElement = editor!.view.dom as HTMLElement
    const lines = getVisualLines(editorElement)
    // Log the lines and their count
    const htmlContentWithLineBreaks = addLineBreaks(hTMLContent, lines)

    const username = await getUserName(user.id)
    const content = await htmlContentToBytesWithCommands(
      htmlContentWithLineBreaks,
      username,
      user.imageUrl
    )
    if (!selectedRecipient) {
      return
    }

    try {
      console.log(selectedRecipient.printerId)
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
        setStatus("Could not connect to printer. Please check if it's online.")
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

  function getVisualLines(element: HTMLElement): Lines {
    const lines: Lines = []
    const positions: { char: string; baseline: number }[] = []
    const range = document.createRange()

    // Get every character and calculate its baseline position
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    let node

    while ((node = walker.nextNode())) {
      const text = node.textContent || ""
      const parentElement = node.parentElement

      for (let i = 0; i < text.length; i++) {
        try {
          range.setStart(node, i)
          range.setEnd(node, i + 1)
          const rect = range.getBoundingClientRect()

          // Get the computed font size of the parent element
          const style = window.getComputedStyle(parentElement!)
          const fontSize = parseFloat(style.fontSize)

          // Calculate the baseline position
          // The baseline is typically around 20% from the bottom for most fonts
          const baseline = rect.bottom - fontSize * 0.2

          positions.push({
            char: text[i],
            baseline: Math.round(baseline),
          })
        } catch (e) {
          console.error("Error measuring character:", e)
        }
      }
    }

    // Sort positions by baseline to handle potential out-of-order characters
    positions.sort((a, b) => a.baseline - b.baseline)

    // Group by baseline position with a tolerance for different font sizes
    let currentLine = ""
    let lastBaseline = positions[0]?.baseline
    const TOLERANCE = 3 // Slightly larger tolerance to account for baseline calculation

    for (const pos of positions) {
      // If the baseline difference is greater than our tolerance, it's a new line
      if (Math.abs((lastBaseline || 0) - pos.baseline) > TOLERANCE) {
        if (currentLine.trim()) {
          lines.push({ characters: currentLine.trim(), characterCount: currentLine.length })
        }
        currentLine = pos.char
        lastBaseline = pos.baseline
      } else {
        currentLine += pos.char
      }
    }

    // Add final line
    if (currentLine.trim()) {
      lines.push({ characters: currentLine.trim(), characterCount: currentLine.length })
    }

    range.detach()
    return lines
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
      case "Printer":
        return "Thermal Printer"
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
          printerId: z.string(),
          name: z.string(),
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

  useEffect(() => {
    if (pageActivated === "Printer") {
      form.setFocus("textEditorInput")
    }
  }, [pageActivated])

  const handleTextChange = (inputText: string, inputHTML: string) => {
    setStatus("Editing")
    setTextContent(inputText)
    setHTMLContent(inputHTML)
    form.setValue("textEditorInput", inputText)
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100,
          newGroupDelay: 500,
        },
        paragraph: {
          HTMLAttributes: {
            // We have the editor on 16px so it doesnt zoom in on mobile automatically. This hack makes it 13px again
            class: "text-[13px]",
          },
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true, HTMLAttributes: { class: "color-white" } }),
      TextStyle,
      CustomMark,
      Image,
    ],
    editorProps: {
      attributes: {
        class:
          "editorStyles text-[13px] font-mono w-full px-4 py-4 min-h-[200px] bg-white border-[1px] border-gray-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] focus:outline-none whitespace-pre-wrap break-word touch-manipulation [--webkit-user-modify:read-write-plaintext-only] [--webkit-text-size-adjust:none] [word-wrap:break-word] [overflow-wrap:break-word] [white-space:pre-wrap] [max-width:100%]",
        "data-gramm": "false", // existing attributes if any
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Backspace") {
          const { from, to } = view.state.selection
          if (from === to) {
            // If no text is selected
            // Get the current position and delete the previous character
            const tr = view.state.tr.delete(from - 1, from)
            view.dispatch(tr)
            return true
          }
        }
        return false
      },
      // Turn dropped in text to plain text without formatting
      handleDrop: (view, event) => {
        const dt = event.dataTransfer
        if (!dt) return true

        // If user is dragging an image aroun, actually accept the drop (not from outside the editor, only inside to inside)
        const html = dt.getData("text/html")
        if (html && (html.includes("<img") || html.includes("data:image"))) {
          return false
        }

        const text = dt.getData("text/plain")
        if (text) {
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (pos) {
            view.dispatch(view.state.tr.insertText(text, pos.pos))
          }
        }
        return true
      },
      handlePaste: (view, event) => {
        if (event?.clipboardData) {
          const text = event.clipboardData.getData("text/plain")
          view.dispatch(view.state.tr.insertText(text))
          return true
        }
        return false
      },
      handleClick: (view, pos, event) => {
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
        if (isTouchDevice) {
          return false
        }

        // Remove selected image class on all images not clicked
        view.state.doc.descendants((_, position) => {
          const element = view.nodeDOM(position) as Element
          if (element instanceof HTMLImageElement) {
            element.classList.remove("selected-image")
          }
        })

        // Add selected image class on the clicked image
        const clickedNode = event.target as Element
        if (clickedNode instanceof HTMLImageElement) {
          clickedNode.classList.toggle("selected-image")
        }
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      handleTextChange(text, editor.getHTML())
    },
  })

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
      <div className="w-[288px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
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
                recipients={recipients}
                setRecipients={setRecipients}
                selectedRecipient={selectedRecipient}
                onSelectRecipient={setSelectedRecipient}
              />
              <Toolbar editor={editor} />
              <form className="text-[16px]">
                <div>
                  <EditorContent
                    {...form.register("textEditorInput")}
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
                  onClick={form.handleSubmit(handlePrinterClick)}
                  className="w-full h-8 border-t bg-[#e4d3b2] border border-b-transparent border-l-transparent border-r-transparent border-[#808080] hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                >
                  {selectedRecipient?.name
                    ? `Send to ${selectedRecipient?.name}`
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
