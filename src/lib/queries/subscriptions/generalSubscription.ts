"use server"

import { db } from "@/lib"
import { printerBroadcastSubscriptions, type PrinterSubscription } from "@/lib/schema/subscriptions"
import { eq } from "drizzle-orm"

export type GetSubscriptions = {
  success: boolean
  message: string
  subscriptions: PrinterSubscription[]
}

export async function getSubscriptionsToRun(timeSend: string): Promise<GetSubscriptions> {
  try {
    const subscriptionsToRun = await db
      .select()
      .from(printerBroadcastSubscriptions)
      .where(eq(printerBroadcastSubscriptions.sendTime, timeSend))

    if (subscriptionsToRun.length == 0) {
      return {
        success: true,
        message: "no jobs",
        subscriptions: [],
      }
    }

    return {
      success: true,
      message: "",
      subscriptions: subscriptionsToRun,
    }
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error)
    return {
      success: false,
      message: "Failed to fetch subscriptions",
      subscriptions: [],
    }
  }
}
