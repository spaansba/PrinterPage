import { useUser } from "@clerk/nextjs"
import React, { useState, type Dispatch, type SetStateAction } from "react"
import { useEditorContext } from "../../context/editorContext"
import { getVisualLinesFromHTML } from "../../_helpers/getVisualLines"
import { getUserName, incrementPrinterMessageStats } from "@/lib/queries"
import { PrepareTextToSend } from "../../_helpers/StringToBytes"
import type { Lines } from "./RetroTextEditor"
import type { Friend } from "./FriendSelector"

type ToasterSendButtonProps = {
  setStatus: Dispatch<SetStateAction<string>>
  hTMLContent: string
  selectedFriend: Friend | null
}

function ToasterSendButton({ setStatus, hTMLContent, selectedFriend }: ToasterSendButtonProps) {
  const { editor, editorForm } = useEditorContext()
  const [buttonClickable, setButtonClickable] = useState(true)
  const { user } = useUser()

  async function handlePrinterClick() {
    if (!user) {
      return
    }
    editor?.setEditable(false)
    setButtonClickable(false)
    setStatus("Sending...")
    const editorElement = editor!.view.dom as HTMLElement
    const lines = getVisualLinesFromHTML(editorElement)
    const htmlContentWithLineBreaks = addLineBreaksToHTML(hTMLContent, lines)
    const username = await getUserName(user.id)
    const content = await PrepareTextToSend(htmlContentWithLineBreaks, username, user.imageUrl)

    if (!selectedFriend) {
      return
    }
    // editor?.setEditable(true)
    // return
    try {
      const response = await fetch(`https://${selectedFriend.printerId}.toasttexter.com/print`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: Array.from(content),
        }),
      })

      const responseText = await response.text()
      if (user) {
        await incrementPrinterMessageStats(user.id, selectedFriend.printerId)
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`)
      }

      // better then instantly removing it
      setTimeout(() => {
        editor?.commands.clearContent()
        editor?.setEditable(true)
        setStatus("Sent successfully!")
      }, 1000)
    } catch (error) {
      editor?.setEditable(true)
      console.error("Error sending to printer:", error)
      if (typeof error === "string") {
        setStatus(error)
      } else if (error instanceof Error) {
        setStatus(error.message)
      } else {
        setStatus("Error sending the message")
      }
    }

    if (editor) {
      editor.commands.focus()
    }
    setTimeout(() => {
      setButtonClickable(true)
    }, 1000)
  }

  function addLineBreaksToHTML(htmlContent: string, lines: Lines): string {
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
  return (
    <div className="">
      <button
        disabled={!buttonClickable}
        onClick={editorForm.handleSubmit(handlePrinterClick)}
        className="w-full h-8 border-t bg-[#e4d3b2] border border-b-transparent border-l-transparent border-r-transparent border-[#808080] hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
      >
        {selectedFriend?.name ? `Toast ${selectedFriend?.name}` : "Choose Recipient"}
      </button>
    </div>
  )
}

export default ToasterSendButton
