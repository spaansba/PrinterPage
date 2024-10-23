"use client"
import { useEffect, useState, useRef } from "react"
import { WordWrap } from "./wordwrap"

export default function Home() {
  const [status, setStatus] = useState("")
  const [formattedValue, setFormattedValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const MAX_WIDTH = 288

  // Keep track of the last input operation
  const lastOperation = useRef({
    text: "",
    cursor: 0,
    timestamp: Date.now(),
  })

  const printingClosingTag = () => {
    return "\n\n" + "*********s*********" + "\n\n\n\n\n"
  }

  async function handlePrinterClick() {
    setStatus("Sending...")
    try {
      const response = await fetch("https://special-eagle-handy.ngrok-free.app/print", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
        body: JSON.stringify({
          message: formattedValue + printingClosingTag(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setStatus("Sent successfully!")
    } catch (error) {
      console.error("Error sending to printer:", error)
      setStatus("Error sending to printer. Please try again.")
    }
  }

  // Handle both input changes and cursor positioning in one synchronous operation
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const currentTime = Date.now()
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0

    // Store the operation details
    lastOperation.current = {
      text: newValue,
      cursor: cursorPos,
      timestamp: currentTime,
    }

    // Clean and format the text
    const cleanValue = newValue.replaceAll("\n", "")
    const formatted = WordWrap.wrap(cleanValue)
    const lines = WordWrap.lines(cleanValue)
    console.log(lines)
    // Calculate cursor position based on the current operation
    const rawBeforeCursor = newValue.substring(0, cursorPos)
    const cleanBeforeCursor = rawBeforeCursor.replaceAll("\n", "")
    const formattedBeforeCursor = WordWrap.wrap(cleanBeforeCursor)
    const newCursorPos = formattedBeforeCursor.length

    // Update all states synchronously
    setFormattedValue(formatted)

    // Schedule cursor update
    requestAnimationFrame(() => {
      // Only update if this is still the most recent operation
      if (lastOperation.current.timestamp === currentTime && textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4 font-mono text-black">
      <textarea
        ref={textareaRef}
        className="w-[600px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none whitespace-pre-wrap"
        onChange={handleTextChange}
        value={formattedValue}
        placeholder="Enter message to print"
        rows={10}
      />
      <div className="text-sm text-gray-500">Max width: {MAX_WIDTH}px</div>
      <button
        onClick={handlePrinterClick}
        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        Send To Printer
      </button>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
      <p className="text-white">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industrys standard dummy text ever since the 1500s, when an unknown printer took a
        galley of type and scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the
      </p>
    </div>
  )
}
