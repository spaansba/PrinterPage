"use server"

import { db } from "@/lib"
import { printerSubscriptions, type printerSubscription } from "@/lib/schema/subscriptions"
import { and, eq } from "drizzle-orm"

export type GetSubscriptions = {
  success: boolean
  message: string
  subscriptions: printerSubscription[]
}

export async function getSubscriptionsToRun(timeSend: string): Promise<GetSubscriptions> {
  try {
    const subscriptionsToRun = await db
      .select()
      .from(printerSubscriptions)
      .where(
        and(eq(printerSubscriptions.active, true), eq(printerSubscriptions.sendTime, timeSend))
      )

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
