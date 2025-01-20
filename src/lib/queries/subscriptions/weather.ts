"use server"
import {
  drawLocationHeader,
  drawWeatherCard,
  weatherCardBytes,
} from "@/app/_helpers/imageCreating/weatherCard"
import { PRINTER_WIDTH } from "@/lib/constants"
import type { PrinterSubscription, TempUnit } from "@/lib/schema/subscriptions"
import { createCanvas } from "canvas"

export const sendWeatherReport = async (sub: PrinterSubscription) => {
  const settings = sub.settingsValues as {
    Temperature: TempUnit
    Location: string
  }
  console.log(settings.Location)

  //TODO this should not be in the sendWeatherReport but whatever
  const weather = await getWeatherReport(settings.Location)
  if (!weather.forecast?.length) return
  const locationHeader = await drawLocationHeader(weather.location!)

  // Create weather cards
  const weatherCards = await Promise.all(
    weather.forecast.map((forecast) => drawWeatherCard(forecast, settings.Temperature))
  )

  const spacing = 10
  const totalHeight =
    locationHeader.canvas.height + weatherCards.length * (weatherCards[0].canvas.height + spacing)

  const combinedCanvas = createCanvas(PRINTER_WIDTH, totalHeight)
  const combinedCtx = combinedCanvas.getContext("2d")
  if (!combinedCtx) return

  // Draw location header first
  combinedCtx.drawImage(locationHeader.canvas, 0, 0)

  // Draw weather cards
  let currentY = locationHeader.canvas.height + spacing
  weatherCards.forEach((card) => {
    combinedCtx.drawImage(card.canvas, 0, currentY)
    currentY += card.canvas.height + spacing
  })

  // Convert to printer bytes
  const content = await weatherCardBytes({
    canvas: combinedCanvas,
    context: combinedCtx,
  })

  const response = await fetch(`https://${sub.printerId}.toasttexter.com/print`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: Array.from(content),
    }),
  })
}

type WeatherCondition = {
  text: string
  icon: string
  code: number
}

type HourlyWeather = {
  time: string
  time_epoch: number
  temp_c: number
  temp_f: number
  condition: WeatherCondition
  wind_kph: number
  wind_mph: number
  wind_degree: number
  wind_dir: string
  pressure_mb: number
  pressure_in: number
  precip_mm: number
  precip_in: number
  humidity: number
  cloud: number
  feelslike_c: number
  feelslike_f: number
  windchill_c: number
  windchill_f: number
  will_it_rain: number
  will_it_snow: number
  chance_of_rain: number
  chance_of_snow: number
  vis_km: number
  vis_miles: number
  is_day: number
}

const PERIOD_CONFIGS = [
  { name: "Morning", hours: [6, 7, 8, 9, 10, 11] },
  { name: "Afternoon", hours: [12, 13, 14, 15, 16, 17] },
  { name: "Evening", hours: [18, 19, 20, 21, 22] },
  { name: "Night", hours: [23, 0, 1, 2, 3, 4, 5] },
] as const

export type WeatherPeriod = (typeof PERIOD_CONFIGS)[number]["name"]

export type PeriodWeather = {
  period: WeatherPeriod
  condition: WeatherCondition
  chance_of_rain: number
  chance_of_snow: number
  cloud: number
  temp_c: number
  temp_f: number
  will_it_rain: number
  will_it_snow: number
  wind_kph: number
  wind_mph: number
  windchill_c: number
  windchill_f: number
  feelslike_c: number
  feelslike_f: number
}

export type weatherLocation = {
  name: string
  region: string
  country: string
  localTimeEpoch: number
}

export type weatherAstro = {
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  moonPhase: string
}

type weather = {
  success: boolean
  message: string
  location: weatherLocation
  periods: PeriodWeather[]
}

const getForecastInPeriods = (hourlyData: any[]) => {
  return PERIOD_CONFIGS.map((period) => {
    const periodData = period.hours.map((hour) => hourlyData[hour]).filter(Boolean)

    const avgData: PeriodWeather = {
      period: period.name,
      temp_c: averageBy(periodData, "temp_c"),
      temp_f: averageBy(periodData, "temp_f"),
      wind_kph: averageBy(periodData, "wind_kph"),
      wind_mph: averageBy(periodData, "wind_mph"),
      windchill_c: averageBy(periodData, "windchill_c"),
      windchill_f: averageBy(periodData, "windchill_f"),
      feelslike_c: averageBy(periodData, "feelslike_c"),
      feelslike_f: averageBy(periodData, "feelslike_f"),
      cloud: averageBy(periodData, "cloud"),
      chance_of_rain: Math.max(...periodData.map((d) => d.chance_of_rain)),
      chance_of_snow: Math.max(...periodData.map((d) => d.chance_of_snow)),
      will_it_rain: periodData.some((d) => d.will_it_rain === 1) ? 1 : 0,
      will_it_snow: periodData.some((d) => d.will_it_snow === 1) ? 1 : 0,
      condition: getMostFrequentCondition(periodData.map((d) => d.condition)),
    }

    return {
      ...avgData,
    }
  }).filter(Boolean)
}

const averageBy = (arr: any[], key: string) => {
  const sum = arr.reduce((acc, curr) => acc + curr[key], 0)
  return Number((sum / arr.length).toFixed(1))
}

const getMostFrequentCondition = (arr: WeatherCondition[]): WeatherCondition => {
  const frequencyMap = arr.reduce((map, condition) => {
    const key = condition.text
    map.set(key, (map.get(key) || 0) + 1)
    return map
  }, new Map<string, number>())

  const mostFrequentText = [...frequencyMap.entries()].sort((a, b) => b[1] - a[1])[0][0]

  return (
    arr.find((condition) => condition.text === mostFrequentText) || {
      code: 401,
      icon: "",
      text: "",
    }
  )
}

export const getWeatherReport = async (userLocation: string) => {
  try {
    const [current, forecast] = await Promise.all([
      fetch(
        `http://api.weatherapi.com/v1/current.json?key=${
          process.env.WEATHER_API_KEY
        }&q=${encodeURIComponent(userLocation)}&aqi=no`
      ),
      fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=${
          process.env.WEATHER_API_KEY
        }&q=${encodeURIComponent(userLocation)}&aqi=no`
      ),
    ])

    if (!current.ok || !forecast.ok) {
      throw new Error("Weather API error")
    }

    const forecastData = await forecast.json()
    const currentData = await current.json()

    const forecastInPeriods = getForecastInPeriods(forecastData.forecast.forecastday[0].hour)

    const weatherLocation: weatherLocation = {
      name: forecastData.location.name,
      country: forecastData.location.country,
      region: forecastData.location.region,
      localTimeEpoch: forecastData.location.localtime_epoch,
    }

    const astroData: weatherAstro = {
      sunrise: forecastData.forecast.forecastday[0].astro.sunrise,
      sunset: forecastData.forecast.forecastday[0].astro.sunset,
      moonrise: forecastData.forecast.forecastday[0].astro.moonrise,
      moonset: forecastData.forecast.forecastday[0].astro.moonset,
      moonPhase: forecastData.forecast.forecastday[0].astro.moon_phase,
    }

    return {
      success: true,
      current: {
        temp_c: currentData.current.temp_c,
        condition: currentData.current.condition.text,
        humidity: currentData.current.humidity,
        wind_kph: currentData.current.wind_kph,
      },
      astro: astroData,
      forecast: forecastInPeriods,
      extra: forecastData,
      location: weatherLocation,
    }
  } catch (error) {
    console.error("Failed to fetch weather:", error)
    return {
      success: false,
      current: null,
      forecast: null,
      astro: null,
    }
  }
}
