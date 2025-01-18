"use client"
import React, { useRef, useState } from "react"
import { CustomEditorProvider } from "../context/editorContext"
import { useAuth } from "@clerk/nextjs"
import AppWindow from "./AppWindow"
import NotSignedInPage from "./NotSignedInPage"
import { getWeatherReport } from "@/lib/queries/subscriptions/weather"
import { PRINTER_WIDTH } from "@/lib/constants"
import { drawWeatherCard } from "../_helpers/imageCreating/weatherCard"

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

  const drawOnCanvas = async (
    weatherResults: Promise<
      { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D | null } | undefined
    >[]
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Wait for all weather cards to be rendered
    const cards = await Promise.all(weatherResults)
    const validCards = cards.filter(
      (card): card is { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D | null } =>
        card !== undefined
    )

    if (validCards.length === 0) return

    // Calculate total height needed
    const totalHeight = validCards.length * (validCards[0].canvas.height + 10)
    canvas.height = totalHeight
    canvas.width = PRINTER_WIDTH

    // Draw each card
    validCards.forEach((card, index) => {
      const y = index * (card.canvas.height + 10)
      ctx.drawImage(card.canvas, 0, y)
    })
  }
  const handleOnClick = async () => {
    const weather = await getWeatherReport("bergschenhoek")
    if (!weather.forecast?.length) return
    console.log(weather.forecast)
    const weatherCards = weather.forecast.map((period) =>
      drawWeatherCard(weather.location!, period)
    )

    await drawOnCanvas(weatherCards)
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
