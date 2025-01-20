"use server"

import { db } from "@/lib"
import {
  printerBroadcastSubscriptions,
  type PrinterSubscription,
  type SubscriptionStatus,
} from "@/lib/schema/subscriptions"
import { and, eq } from "drizzle-orm"

export type GetSubscriptions = {
  success: boolean
  message: string
  subscriptions: PrinterSubscription[]
}

export async function updateSubscriptionStatus(
  printerId: string,
  subId: string,
  status: SubscriptionStatus
) {
  //TODO rate limiting etc
  const updated = await db
    .update(printerBroadcastSubscriptions)
    .set({
      status: status,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(printerBroadcastSubscriptions.printerId, printerId),
        eq(printerBroadcastSubscriptions.id, subId)
      )
    )
}

export async function updateSubSettings(
  printerId: string,
  subId: string,
  newSettings: Record<string, string>
): Promise<{ success: boolean; message: string; data: PrinterSubscription | null }> {
  // TODO: check if user has access to update sub settings
  try {
    const updated = await db
      .update(printerBroadcastSubscriptions)
      .set({
        settingsValues: newSettings,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(printerBroadcastSubscriptions.printerId, printerId),
          eq(printerBroadcastSubscriptions.id, subId)
        )
      )
      .returning()

    const subscription = updated[0]

    if (!updated) {
      return {
        success: false,
        message: "Subscription not found",
        data: null,
      }
    }

    return {
      success: true,
      message: "Settings updated successfully",
      data: subscription,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to update settings",
      data: null,
    }
  }
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
