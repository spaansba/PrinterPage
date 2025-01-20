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

type UpdateSubscriptionParams = {
  status?: SubscriptionStatus
  sendTime?: string // Time in HH:mm format
}

export async function updatePrinterSubscription(
  printerId: string,
  subId: string,
  updates: UpdateSubscriptionParams
) {
  try {
    // Early return if no updates provided
    if (Object.keys(updates).length === 0) {
      return {
        success: false,
        message: "No update parameters provided",
      }
    }

    // Build the update object dynamically
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (updates.status !== undefined) {
      updateData.status = updates.status
    }

    if (updates.sendTime !== undefined) {
      updateData.sendTime = updates.sendTime
    }

    const updated = await db
      .update(printerBroadcastSubscriptions)
      .set(updateData)
      .where(
        and(
          eq(printerBroadcastSubscriptions.printerId, printerId),
          eq(printerBroadcastSubscriptions.id, subId)
        )
      )

    // Check if any rows were affected
    if (updated.rowCount === 0) {
      return {
        success: false,
        message: "Subscription not found or no changes made",
      }
    }

    return {
      success: true,
      message: "Subscription updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
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
      .where(
        and(
          eq(printerBroadcastSubscriptions.sendTime, timeSend),
          eq(printerBroadcastSubscriptions.status, "active")
        )
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
