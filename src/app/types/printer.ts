import type { TempUnit } from "@/lib/schema/subscriptions"

export type Toaster = {
  id: string
  name: string
  profilePicture: string | null
  toastsReceived: number
  pairedAccounts?: ToasterUser[]
  subscriptions: ToasterSubscriptions
}

export type ToasterSubscriptions = {
  Weahter: WeatherSubOptions
}

export type WeatherSubOptions = {
  sendTime: string
  location: string
  tempUnit: TempUnit
}

export type tempUnit = "Celsius" | "Fahrenheit"

export type ToasterUser = {
  id: string
  username: string
  toastsSend: number
  profileImageUrl?: string | null
}

export type Friend = {
  printerId: string
  name: string
  lastSendMessage: string
  profilePicture: string | null
}

export type DBResult = {
  success: boolean
  message: string
}

export type DBResultToaster = DBResult & {
  data: Toaster
}

export type DBResultUser = DBResult & {
  data: ToasterUser
}
