import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { sendWeatherReport } from "@/lib/queries/subscriptions/weather"
import {
  getSubscriptionsToRun,
  type GetSubscriptions,
} from "@/lib/queries/subscriptions/generalSubscription"
import { registerFonts } from "@/lib/registerFonts"
import { sendDadJoke } from "@/lib/queries/subscriptions/dadJokes"

export async function GET() {
  const headersList = await headers()
  const token = headersList.get("x-cron-token")
  const timeHeader = headersList.get("x-time-send")
  const devHeader = headersList.get("x-enable-dev-mode")

  if (devHeader) {
    await sendSubsToDevDevice()
    return NextResponse.json({ status: "dev successful" }, { status: 200 })
  }

  const dateSend = timeHeader ? new Date(Number(timeHeader) * 1000) : new Date()
  const timeSend = RoundToClosest5Minutes(dateSend)

  if (token !== process.env.CRON_ORG_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Get array of the subscriptions
    const subscriptions: GetSubscriptions = await getSubscriptionsToRun(timeSend)

    if (!subscriptions.success) {
      return NextResponse.json({ status: subscriptions.message }, { status: 406 })
    }

    if (subscriptions.subscriptions.length === 0) {
      return NextResponse.json({ status: subscriptions.message }, { status: 200 })
    }

    registerFonts()

    // Array to collect all errors during processing
    const errors: Array<{ subscriptionId: string; error: string }> = []

    // Process all subscriptions
    for (const sub of subscriptions.subscriptions) {
      try {
        switch (sub.broadcastId) {
          case "1":
            const dadJokeResult = await sendDadJoke(sub.printerId)
            if (!dadJokeResult.success) {
              const errorMessage = dadJokeResult.error || "Unknown error sending dad joke"
              console.error(`Error sending dad joke to ${sub.printerId}: ${errorMessage}`)
              errors.push({ subscriptionId: sub.id, error: errorMessage })
            }
            break
          case "2":
            const weatherReport = await sendWeatherReport(sub)
            if (!weatherReport.success) {
              const errorMessage = weatherReport.error || "Unknown error sending weather report"
              console.error(`Error sending weather report to ${sub.printerId}: ${errorMessage}`)
              errors.push({ subscriptionId: sub.id, error: errorMessage })
            }
            break
          default:
            const errorMessage = `Unknown broadcast ID: ${sub.broadcastId}`
            console.error(errorMessage)
            errors.push({ subscriptionId: sub.id, error: errorMessage })
            break
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error processing subscription ${sub.id}:`, errorMessage)
        errors.push({ subscriptionId: sub.id, error: errorMessage })
      }
    }

    return NextResponse.json(
      {
        status: `Processed ${subscriptions.subscriptions.length} subscriptions`,
        successCount: subscriptions.subscriptions.length - errors.length,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: errors.length > 0 ? 207 : 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Subscription processing failed:", errorMessage)
    return NextResponse.json(
      {
        status: "error",
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

// Development testing function
const sendSubsToDevDevice = async () => {
  await sendDadJoke("fcs2ean4kg")
  await sendWeatherReport({
    broadcastId: "1",
    id: "1",
    printerId: "fcs2ean4kg",
    createdAt: "2025-01-19 17:41:49.271188",
    sendTime: "9:15",
    settingsValues: {
      Temperature: "Celsius",
      Location: "Rotterdam",
    },
    status: "active",
    updatedAt: "2025-01-19 17:41:49.271188",
  })
}

const RoundToClosest5Minutes = (time: Date) => {
  const coeff = 1000 * 60 * 5
  const roundedDate = new Date(Math.round(time.getTime() / coeff) * coeff)
  const hours = roundedDate.getUTCHours().toString().padStart(2, "0")
  const minutes = roundedDate.getUTCMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}
