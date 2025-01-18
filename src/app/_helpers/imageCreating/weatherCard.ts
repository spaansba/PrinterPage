import type { PeriodWeather, weatherLocation } from "@/lib/queries/subscriptions/weather"
import { baseCanvas, loadImage } from "../createImagesToPrint"
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder"
import type { imageCanvas } from "./toastBanner"
import { PRINTER_WIDTH } from "@/lib/constants"

export const weatherCardBytes = async (imageCanvas: imageCanvas) => {
  const encoder = new ReceiptPrinterEncoder({
    printerModel: "pos-8360",
    columns: 32,
    newLine: "\n",
    imageMode: "column",
    font: "9x17",
  })

  const image = imageCanvas.context?.getImageData(
    0,
    0,
    imageCanvas.canvas.width,
    imageCanvas.canvas.height
  )
  return encoder
    .initialize()
    .raw([0x1b, 0x40])
    .font("a")
    .size(1)
    .image(image, PRINTER_WIDTH, imageCanvas.canvas.height, "atkinson", 128)
    .rule()
    .newline(2)
    .align("left")
    .encode()
}

export const drawLocationHeader = async (location: weatherLocation): Promise<imageCanvas> => {
  // Create a canvas with a standard height for the header
  const base = baseCanvas(80)
  if (!base.context) return base

  const ctx = base.context

  // Background fill
  //   ctx.fillStyle = "#4A90E2"
  //   ctx.fillRect(0, 0, base.canvas.width, base.canvas.height)

  // Text styling
  ctx.fillStyle = "#000000" // White text
  ctx.textAlign = "center"

  // Location name (main text)
  ctx.font = "bold 30px Courier New"
  ctx.fillText(location.name, base.canvas.width / 2, 25)

  // Smaller text for region and country
  ctx.font = "22px Courier New"
  const subLocationText = `${location.region}, ${location.country}`
  ctx.fillText(subLocationText, base.canvas.width / 2, 60)

  return base
}

export const drawWeatherCard = async (forcast: PeriodWeather): Promise<imageCanvas> => {
  const base = baseCanvas(120)
  const iconSize = 80
  const yCenterOffset = 10
  if (!base.context) return base

  const ctx = base.context
  ctx.fillStyle = "#E8E8E8"
  ctx.fillRect(0, 0, base.canvas.width, base.canvas.height)

  // Period text at top
  ctx.fillStyle = "#000000"
  ctx.font = "bold 24px Courier New"
  ctx.fillText(forcast.period, 10, 25)

  // Weather icon with black filter
  const weatherImg = await loadImage(forcast.condition.icon)
  ctx.filter = "brightness(0)" // Make everything black
  ctx.drawImage(
    weatherImg,
    5,
    (base.canvas.height - iconSize) / 2 + yCenterOffset,
    iconSize,
    iconSize
  )
  ctx.filter = "none"

  // Temperature
  const tempNum = `${forcast.temp_c}`

  // Main temperature number
  ctx.font = "bold 38px Courier New"
  const metrics = ctx.measureText(tempNum)
  const fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  const tempWidth = metrics.width
  const tempX = iconSize + 32 + (120 - (iconSize + 32)) / 2 - tempWidth / 2
  const tempY =
    (base.canvas.height + fontHeight) / 2 - metrics.actualBoundingBoxDescent + yCenterOffset
  ctx.fillText(tempNum, tempX, tempY)

  // °C superscript
  ctx.font = "bold 22px Courier New"
  ctx.fillText("°C", tempX + tempWidth - 4, tempY - fontHeight + 3)

  // Info column
  const infoX = iconSize + 115
  ctx.font = "16px Courier New"
  ctx.fillText(`Chance of rain: ${forcast.chance_of_rain}%`, infoX, 40)
  ctx.fillText(`Wind: ${forcast.wind_kph} km/h`, infoX, 65)
  ctx.fillText(`Feels Like: ${forcast.feelslike_c}°C`, infoX, 90)

  return base
}
