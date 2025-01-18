"use client"
import React, { useRef, useState } from "react"
import { CustomEditorProvider } from "../context/editorContext"
import { useAuth } from "@clerk/nextjs"
import AppWindow from "./AppWindow"
import NotSignedInPage from "./NotSignedInPage"
import { getWeatherReport } from "@/lib/queries/subscriptions/weather"
import { PRINTER_WIDTH } from "@/lib/constants"
import { drawWeatherCard, weatherCardBytes } from "../_helpers/imageCreating/weatherCard"

export type SendStatus = {
  friend: string
  success: boolean
  errorMessage: string
}

export type messageStatus = {
  editorStatus: string
  sendStatus: SendStatus[] | []
}

function MainWrapper() {
  const { isLoaded, isSignedIn } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [messageStatus, setMessageStatus] = useState<messageStatus>({
    editorStatus: "",
    sendStatus: [],
  })
  const [hTMLContent, setHTMLContent] = useState("")

  const handleTextChange = (inputText: string, inputHTML: string) => {
    if (inputText.length > 0 && inputHTML != hTMLContent) {
      setMessageStatus({ sendStatus: [], editorStatus: "Editing" })
    }
    if (inputText.length == 0) {
      setMessageStatus((prev) => ({ ...prev, editorStatus: "" }))
    }
    setHTMLContent(inputHTML)
  }

  const handleOnClick = async () => {
    const weather = await getWeatherReport("bergschenhoek")
    if (!weather.forecast?.length) return
    console.log(weather)
    // Create weather cards and combine them
    const firstCard = await drawWeatherCard(weather.location!, weather.forecast[0])
    if (!firstCard) return

    // Create a new canvas with the total height needed
    const combinedCanvas = document.createElement("canvas")
    const combinedCtx = combinedCanvas.getContext("2d")
    if (!combinedCtx) return

    const cardHeight = firstCard.canvas.height
    const spacing = 10
    const totalHeight = weather.forecast.length * (cardHeight + spacing)

    combinedCanvas.width = PRINTER_WIDTH
    combinedCanvas.height = totalHeight

    // Draw first card
    combinedCtx.drawImage(firstCard.canvas, 0, 0)

    // Draw remaining cards
    let currentY = cardHeight + spacing
    for (let i = 1; i < weather.forecast.length; i++) {
      const card = await drawWeatherCard(weather.location!, weather.forecast[i])
      if (!card) continue
      combinedCtx.drawImage(card.canvas, 0, currentY)
      currentY += cardHeight + spacing
    }

    // Display on page
    const displayCanvas = canvasRef.current
    if (!displayCanvas) return
    const displayCtx = displayCanvas.getContext("2d")
    if (!displayCtx) return

    displayCanvas.width = combinedCanvas.width
    displayCanvas.height = combinedCanvas.height
    displayCtx.drawImage(combinedCanvas, 0, 0)

    try {
      const content = await weatherCardBytes({
        canvas: combinedCanvas,
        context: combinedCtx,
      })

      await fetch(`https://fcs2ean4kg.toasttexter.com/print`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: Array.from(content),
        }),
      })
    } catch (error) {
      console.error("Error sending to printer:", error)
    }
  }

  if (!isLoaded) return null

  if (isSignedIn) {
    return (
      <div className="flex flex-col items-center w-full">
        <CustomEditorProvider handleTextChange={handleTextChange}>
          <AppWindow
            messageStatus={messageStatus}
            setMessageStatus={setMessageStatus}
            hTMLContent={hTMLContent}
          />
        </CustomEditorProvider>
        <button
          className="my-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleOnClick}
        >
          Get Weather Cards
        </button>
        <canvas ref={canvasRef} className="border border-gray-300 rounded" />
      </div>
    )
  }

  return <NotSignedInPage />
}

export default MainWrapper
