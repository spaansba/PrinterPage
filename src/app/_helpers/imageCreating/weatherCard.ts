import type { PeriodWeather, weatherLocation } from "@/lib/queries/subscriptions/weather"
import { baseCanvas, loadImage } from "../createImagesToPrint"

export const drawWeatherCard = async (location: weatherLocation, forcast: PeriodWeather) => {
  const base = baseCanvas(80)
  const iconSize = 50
  if (!base.context) return

  const ctx = base.context
  ctx.fillStyle = "#E8E8E8"
  ctx.fillRect(0, 0, base.canvas.width, base.canvas.height)

  // Weather icon
  const weatherImg = await loadImage(forcast.condition.icon)
  ctx.drawImage(weatherImg, 10, (base.canvas.height - iconSize) / 2, iconSize, iconSize)

  // Temperature
  ctx.fillStyle = "#000000"
  const tempNum = `${forcast.temp_c}`

  // Main temperature number
  ctx.font = "bold 36px Arial"
  const metrics = ctx.measureText(tempNum)
  const fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  const tempWidth = metrics.width
  const tempX = iconSize + 30 + (120 - (iconSize + 30)) / 2 - tempWidth / 2
  const tempY = (base.canvas.height + fontHeight) / 2 - metrics.actualBoundingBoxDescent
  ctx.fillText(tempNum, tempX, tempY)

  // °C superscript
  ctx.font = "16px Arial"
  ctx.fillText("°C", tempX + tempWidth + 2, 35)

  // Info column
  const infoX = iconSize + 120
  ctx.font = "12px Arial"
  ctx.fillText(`Change of rain: ${forcast.chance_of_rain}%`, infoX, 25)
  ctx.fillText(`Wind: ${forcast.wind_kph} km/h`, infoX, 45)
  ctx.fillText(`Feels Like ${forcast.feelslike_c}°C`, infoX, 65)

  return base
}
