"use client"
import { useState, useRef } from "react"
import { WordWrap } from "./wordwrap"
import RetroTextEditor from "./_components/RetroTextEditor"

export default function Home() {
  const [status, setStatus] = useState("")
  const [formattedValue, setFormattedValue] = useState("")
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
  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (status != "") {
      setStatus("")
    }

    const currentTime = Date.now()
    const newValue = e.currentTarget.textContent
    // console.log(e.currentTarget.getHTML())
    // console.log(newValue)
    if (!newValue) {
      return
    }
    const cursorPos = 10000
    // Store the operation details
    lastOperation.current = {
      text: newValue,
      cursor: cursorPos,
      timestamp: currentTime,
    }

    // Clean and format the text
    const cleanValue = newValue.replaceAll("\n", "")
    const formatted = WordWrap.wrap(cleanValue)

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
      // if (lastOperation.current.timestamp === currentTime && textareaRef.current) {
      //   // textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      // }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6 font-mono text-black bg-[#d4d0c8]">
      {/* Main Editor Window */}
      <RetroTextEditor
        handleChange={handleTextChange}
        setFormattedValue={setFormattedValue}
        formattedValue={formattedValue}
        status={status}
      ></RetroTextEditor>
      {/* Print Button */}
      <button
        onClick={handlePrinterClick}
        className="min-w-[120px] h-8 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white px-4 text-sm font-bold hover:bg-[#e6e3de]"
      >
        Send To Printer
      </button>

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
