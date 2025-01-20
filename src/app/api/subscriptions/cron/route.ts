import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { sendWeatherReport } from "@/lib/queries/subscriptions/weather"
import {
  getSubscriptionsToRun,
  type GetSubscriptions,
} from "@/lib/queries/subscriptions/generalSubscription"
import { registerFonts } from "@/lib/registerFonts"

export async function GET() {
  const headersList = await headers()
  const token = headersList.get("x-cron-token")
  const timeHeader = headersList.get("x-time-send")
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

    if (subscriptions.subscriptions.length == 0) {
      return NextResponse.json({ status: subscriptions.message }, { status: 200 })
    }

    registerFonts()

    for (const sub of subscriptions.subscriptions) {
      await sendWeatherReport(sub)
    }

    return NextResponse.json(
      { status: `endpoint hit ${subscriptions.subscriptions.length} send` },
      { status: 500 }
    )
  } catch (error) {
    console.error("Cleanup failed:", error)
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}

const RoundToClosest5Minutes = (time: Date) => {
  const coeff = 1000 * 60 * 5
  const roundedDate = new Date(Math.round(time.getTime() / coeff) * coeff)
  const hours = roundedDate.getUTCHours().toString().padStart(2, "0")
  const minutes = roundedDate.getUTCMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}
