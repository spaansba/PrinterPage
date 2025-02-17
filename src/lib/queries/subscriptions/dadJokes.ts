import { dadJokeCardBytes } from "@/app/_helpers/imageCreating/dadjokeCard"
import type { PrinterSubscription } from "@/lib/schema/subscriptions"
import { sendSubscription } from "./generalSubscription"

type DadJokeResponse = {
  id: string
  joke: string
  status: number
}

export const sendDadJoke = async (printerId: string) => {
  const dadJoke: DadJokeResponse = await getDadJoke()
  const content = await dadJokeCardBytes(dadJoke.joke)
  const send = sendSubscription(content, printerId)
}

export const getDadJoke = async (): Promise<DadJokeResponse> => {
  try {
    const response = await fetch("https://icanhazdadjoke.com/", {
      headers: {
        Accept: "application/json",
        "User-Agent": "toasttexter.com", // Replace with your app info
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch dad joke: ${response.status}`)
    }

    const data: DadJokeResponse = await response.json()
    console.log(data)

    return data
  } catch (error) {
    console.error("Error fetching dad joke:", error)
    throw error
  }
}
