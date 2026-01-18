import type { Canvas, SKRSContext2D as NodeCanvasContext } from "@napi-rs/canvas"
import { baseCanvas, drawCircularImage } from "../createImagesToPrint"

export type imageCanvas = {
  canvas: Canvas
  context: NodeCanvasContext
}

export async function createBannerSection(bannerImage: HTMLImageElement): Promise<ImageData> {
  const { canvas, context } = baseCanvas(88)
  if (!context) throw new Error("Could not get canvas context")

  context.drawImage(bannerImage, 0, 0, canvas.width, canvas.height)
  return context.getImageData(0, 0, canvas.width, canvas.height)
}

export async function createProfileSection(
  profileImage: HTMLImageElement,
  sender: string
): Promise<ImageData> {
  const profileSize = 56
  const { canvas, context } = baseCanvas(profileSize + 16)
  if (!context) throw new Error("Could not get canvas context")

  drawCircularImage(context, profileImage, 10, 4, profileSize)

  context.font = "bold 34px Arial"
  context.textBaseline = "middle"
  const textY = profileSize / 3 + 4
  context.fillText(sender, profileSize + 20, textY)

  context.font = "24px Arial"
  context.fillText(getFormattedDateTime(), profileSize + 20, textY + 30)

  return context.getImageData(0, 0, canvas.width, canvas.height)
}

const getFormattedDateTime = (): string => {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, "0")
  const month = (now.getMonth() + 1).toString().padStart(2, "0")
  const year = now.getFullYear()
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const seconds = now.getSeconds().toString().padStart(2, "0")
  return `${hours}:${minutes}:${seconds}, ${day}/${month}/${year}`
}
