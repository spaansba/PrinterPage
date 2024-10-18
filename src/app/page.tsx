"use client"
import { useState } from "react"

export default function Home() {
  const [inputValue, setInputValue] = useState("")
  const [status, setStatus] = useState("")

  async function handlePrinterClick() {
    setStatus("Sending...")
    try {
      const response = await fetch("https://5abf-45-84-40-171.ngrok-free.app/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setStatus("Sent successfully!")
      setInputValue("") // Clear input after successful send
    } catch (error) {
      console.error("Error sending to printer:", error)
      setStatus("Error sending to printer. Please try again.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4 font-sans text-black">
      <input
        type="text"
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
        placeholder="Enter message to print"
      />
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
