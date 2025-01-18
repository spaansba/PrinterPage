"use client"
import { useEffect, useRef, useState } from "react"
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

  if (!isLoaded) {
    return null
  }
  const handleOnClick = async () => {
    const weather = await getWeatherReport("bergschenhoek")
    console.log(weather)
    if (weather.forecast?.length == 0 || !weather.forecast) {
      return
    }
    const weatherCards = weather.forecast.map((period) =>
      drawWeatherCard(weather.location!, period)
    )
    await Promise.all(weatherCards)
    console.log(weatherCards)
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    canvas.width = PRINTER_WIDTH
    canvas.height = 88
    context.fillStyle = "green"
  }, []) // Empty dependency array means this runs once when component mounts

  if (isSignedIn) {
    return (
      <>
        <CustomEditorProvider handleTextChange={handleTextChange}>
          <AppWindow
            messageStatus={messageStatus}
            setMessageStatus={setMessageStatus}
            hTMLContent={hTMLContent}
          />
        </CustomEditorProvider>
        <button className="size-10 bg-slate-300" onClick={handleOnClick}></button>
        <canvas ref={canvasRef} id="canvas"></canvas>
      </>
    )
  }

  return <NotSignedInPage />
}

export default MainWrapper
