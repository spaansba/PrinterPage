import type { PeriodWeather, weatherLocation } from "@/lib/queries/subscriptions/weather"
import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder"
import { PRINTER_WIDTH } from "@/lib/constants"
import { createCanvas, loadImage } from "canvas"
import { imageCanvas } from "./toastBanner"

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

export const drawLocationHeader = async (location: weatherLocation) => {
  // Create a canvas with a standard height for the header
  const canvas = createCanvas(PRINTER_WIDTH, 96) // Increased height to accommodate date
  const ctx = canvas.getContext("2d")
  if (!ctx) return { canvas, ctx }

  ctx.fillStyle = "#000000"
  ctx.textAlign = "center"

  // Date from localTimeEpoch
  const localDate = new Date(location.localTimeEpoch * 1000)
  const dateString = localDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Add date below location name
  ctx.font = "18px Courier New"
  ctx.fillText(dateString, canvas.width / 2, 15)

  // Location name (main text)
  ctx.font = "bold 40px Courier New"
  ctx.fillText(location.name, canvas.width / 2, 55)

  // Smaller text for region and country
  const regionAndCountry = `${location.region}, ${location.country}`
  if (regionAndCountry.length > 26) {
    ctx.font = "18px Courier New"
  } else {
    ctx.font = "24px Courier New"
  }
  const subLocationText = regionAndCountry
  ctx.fillText(subLocationText, canvas.width / 2, 90)

  return { canvas, ctx }
}

export const drawWeatherCard = async (forcast: PeriodWeather) => {
  const canvas = createCanvas(PRINTER_WIDTH, 120)
  const ctx = canvas.getContext("2d")
  const iconSize = 55
  const yCenterOffset = 10
  if (!ctx) return { canvas, ctx }

  ctx.fillStyle = "#E8E8E8"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Period text at top
  ctx.fillStyle = "#000000"
  ctx.font = "bold 24px Courier New"
  ctx.fillText(forcast.period, 10, 25)

  // Weather icon with black filter

  loadImage(`https:${forcast.condition.icon}`).then((image) => {
    ctx.drawImage(image, 5, (canvas.height - iconSize) / 2 + yCenterOffset, iconSize, iconSize)
  })

  // ctx.filter = "brightness(0)" // Make everything black

  // ctx.filter = "none"

  // Temperature
  const tempNum = `${formatNumber(forcast.temp_c)}`

  // Main temperature number
  ctx.font = "bold 38px Courier New"
  const metrics = ctx.measureText(tempNum)
  const fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  const tempWidth = metrics.width
  const tempX = iconSize + 35 + (120 - (iconSize + 35)) / 2 - tempWidth / 2
  const tempY = (canvas.height + fontHeight) / 2 - metrics.actualBoundingBoxDescent + yCenterOffset
  ctx.fillText(tempNum, tempX, tempY)

  // °C superscript
  ctx.font = "bold 22px Courier New"
  ctx.fillText("°C", tempX + tempWidth - 4, tempY - fontHeight + 3)

  // Info column
  const infoX = iconSize + 145
  ctx.font = "16px Courier New"
  ctx.fillText(`Chance of rain: ${forcast.chance_of_rain}%`, infoX, 40)
  ctx.fillText(`Wind: ${forcast.wind_kph} km/h`, infoX, 65)
  ctx.fillText(`Feels Like: ${forcast.feelslike_c}°C`, infoX, 90)

  return { canvas, ctx }
}

const formatNumber = (c: number, totalLength: number = 5): string => {
  // Convert to string with one decimal place
  const formattedNum = c.toFixed(1)

  // Pad or trim to ensure consistent length
  return formattedNum.padStart(totalLength, " ")
}
