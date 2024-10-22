"use client"
import { useEffect, useState, useRef } from "react"
import { WordWrap } from "./wordwrap"
export default function Home() {
  const [inputValue, setInputValue] = useState("")
  const [status, setStatus] = useState("")
  const [formattedValue, setFormattedValue] = useState("")
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const MAX_WIDTH = 288

  function charValues(value: string): [number, number] {
    const width = 9
    const height = 17
    return [width, height]
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
          message: inputValue,
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setCursorPosition(e.target.selectionStart)
    setInputValue(newValue)
  }

  // Handle cursor position
  useEffect(() => {
    if (cursorPosition !== null && textareaRef.current) {
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  }, [formattedValue, cursorPosition])

  // Format text effect
  useEffect(() => {
    const newInput = inputValue.replace("\n", "")
    const result = WordWrap.wrap(newInput)
    setFormattedValue(result)
  }, [inputValue])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4 font-mono text-black">
      <textarea
        ref={textareaRef}
        className="w-[600px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap"
        onChange={handleTextChange}
        value={formattedValue}
        placeholder="Enter message to print"
        rows={10}
      />
      <div className="text-sm text-gray-500">Max width: {MAX_WIDTH}px</div>
      <button
        onClick={handlePrinterClick}
        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Send To Printer
      </button>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  )
}
