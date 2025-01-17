"use server"

import { and, eq, sql } from "drizzle-orm"
import { printerSubscriptions, type printerSubscription } from "../schema/subscriptions"
import { db } from ".."

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

export const sendWeatherReport = async (sub: printerSubscription) => {
  const content = new TextEncoder().encode("hello world")
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

export const sendNewsReport = async (sub: printerSubscription) => {}
