"use client"
import { useState, useRef } from "react"
import RetroTextEditor from "./_components/RetroTextEditor"
import { htmlContentToBytesWithCommands } from "./_components/StringToBytes"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

export default function Home() {
  const [status, setStatus] = useState("")
  const [textContent, setTextContent] = useState("")
  const [hTMLContent, setHTMLcontent] = useState("")
  const MAX_WIDTH = 288

  async function handlePrinterClick() {
    setStatus("Sending...")
    const content = htmlContentToBytesWithCommands(hTMLContent)
    console.log(content)
    try {
      const response = await fetch("https://special-eagle-handy.ngrok-free.app/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: Array.from(content),
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

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-6 font-mono text-black bg-[#d4d0c8]">
      {/* Main Editor Window */}
      <RetroTextEditor
        setTextContent={setTextContent}
        textContent={textContent}
        status={status}
        setStatus={setStatus}
        setHTMLContent={setHTMLcontent}
        hTMLContent={hTMLContent}
      ></RetroTextEditor>
      {/* Print Button */}
      <SignedOut>
        <SignInButton>
          <button className="min-w-[120px] h-8 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white px-4 text-sm font-bold hover:bg-[#e6e3de]">
            Sign in to send prints
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <button
          onClick={handlePrinterClick}
          className="min-w-[120px] h-8 bg-[#d4d0c8] border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white px-4 text-sm font-bold hover:bg-[#e6e3de]"
        >
          Send To Printer
        </button>
      </SignedIn>
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
