"use server"
import type { printerSubscription } from "@/lib/schema/subscriptions"

export const sendWeatherReport = async (sub: printerSubscription) => {
  const content = new TextEncoder().encode("hello world")
  const weather = getWeatherReport("amsterdam")
  // const response = await fetch(`https://${sub.printerId}.toasttexter.com/print`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     data: Array.from(content),
  //   }),
  // })
  // console.log(response)
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

type PeriodWeather = {
  period: WeatherPeriod
  condition: string
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

type weatherLocation = {
  name: string
  region: string
  country: string
}

type weather = {
  success: boolean
  message: string
  location: weatherLocation
  periods: PeriodWeather[]
}

const processWeatherData = (hourlyData: any[]) => {
  return PERIOD_CONFIGS.map((period) => {
    const periodData = period.hours.map((hour) => hourlyData[hour]).filter(Boolean)

    if (periodData.length === 0) return null

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
      condition: getMostFrequent(periodData.map((d) => d.condition.text)),
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

const getMostFrequent = (arr: string[]): string => {
  if (!arr.length) return "Unknown"
  return (
    arr
      .sort((a, b) => arr.filter((v) => v === a).length - arr.filter((v) => v === b).length)
      .pop() || "Unknown"
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

    const processedData = processWeatherData(forecastData.forecast.forecastday[0].hour)
    console.log(processedData)
    const weatherLocation: weatherLocation = {
      name: forecastData.location.name,
      country: forecastData.location.country,
      region: forecastData.location.region,
    }

    return {
      success: true,
      current: {
        temp_c: currentData.current.temp_c,
        condition: currentData.current.condition.text,
        humidity: currentData.current.humidity,
        wind_kph: currentData.current.wind_kph,
      },
      forecast: processedData,
      extra: forecastData,
      location: weatherLocation,
    }
  } catch (error) {
    console.error("Failed to fetch weather:", error)
    return {
      success: false,
      current: null,
      forecast: null,
    }
  }
}

export const sendNewsReport = async (sub: printerSubscription) => {}
