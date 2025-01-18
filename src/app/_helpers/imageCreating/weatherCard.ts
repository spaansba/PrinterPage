import type { PeriodWeather, weatherLocation } from "@/lib/queries/subscriptions/weather"
import { baseCanvas } from "../createImagesToPrint"

export const drawWeatherCard = (location: weatherLocation, forcast: PeriodWeather) => {
  const base = baseCanvas(120)
  if (!base) {
    return
  }
  forcast.condition
}
