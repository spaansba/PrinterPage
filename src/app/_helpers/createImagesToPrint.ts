import { PRINTER_WIDTH } from "@/lib/constants"

export const baseCanvas = (height: number, width: number = PRINTER_WIDTH) => {
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  canvas.width = width
  canvas.height = height
  return { canvas, context }
}

export function drawCircularImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  context.save()
  context.beginPath()
  context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  context.clip()
  context.drawImage(image, x, y, size, size)
  context.restore()
}

export function loadImage(src: string, timeout = 10000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = (error) => reject(new Error(`Failed to load image: ${error}`))
    img.src = src
    setTimeout(() => reject(new Error("Image loading timed out")), timeout)
  })
}
