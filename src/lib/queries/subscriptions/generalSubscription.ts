"use server";

import { db } from "@/lib";
import {
  printerBroadcastSubscriptions,
  type PrinterSubscription,
  type SubscriptionStatus,
} from "@/lib/schema/subscriptions";
import { and, eq } from "drizzle-orm";

export type GetSubscriptions = {
  success: boolean;
  message: string;
  subscriptions: PrinterSubscription[];
};

type UpdateSubscriptionParams = {
  status?: SubscriptionStatus;
  sendTime?: string; // Time in HH:mm format
};

export async function sendSubscription(
  content: Uint8Array,
  printerId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`https://${printerId}.toasttexter.com/print`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: Array.from(content),
      }),
    });

    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.message ||
          `HTTP error ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }

      console.error(
        `Error sending subscription to ${printerId}: ${errorMessage}`,
      );
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `Failed to send subscription to ${printerId}: ${errorMessage}`,
    );
    return { success: false, error: errorMessage };
  }
}

export async function updatePrinterSubscription(
  printerId: string,
  subId: string,
  updates: UpdateSubscriptionParams,
) {
  try {
    // Early return if no updates provided
    if (Object.keys(updates).length === 0) {
      return {
        success: false,
        message: "No update parameters provided",
      };
    }

    // Build the update object dynamically
    const updateData: Record<string, unknown> = {};

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    if (updates.sendTime !== undefined) {
      updateData.sendTime = updates.sendTime;
    }

    const updated = await db
      .update(printerBroadcastSubscriptions)
      .set(updateData)
      .where(
        and(
          eq(printerBroadcastSubscriptions.printerId, printerId),
          eq(printerBroadcastSubscriptions.id, subId),
        ),
      );

    // Check if any rows were affected
    if (updated.rowCount === 0) {
      return {
        success: false,
        message: "Subscription not found or no changes made",
      };
    }

    return {
      success: true,
      message: "Subscription updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function updateSubSettings(
  printerId: string,
  subId: string,
  newSettings: Record<string, string>,
): Promise<{
  success: boolean;
  message: string;
  data: PrinterSubscription | null;
}> {
  // TODO: check if user has access to update sub settings
  try {
    const updated = await db
      .update(printerBroadcastSubscriptions)
      .set({
        settingsValues: newSettings,
      })
      .where(
        and(
          eq(printerBroadcastSubscriptions.printerId, printerId),
          eq(printerBroadcastSubscriptions.id, subId),
        ),
      )
      .returning();

    const subscription = updated[0];

    if (!updated) {
      return {
        success: false,
        message: "Subscription not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Settings updated successfully",
      data: subscription,
    };
  } catch {
    return {
      success: false,
      message: "Failed to update settings",
      data: null,
    };
  }
}

export async function getSubscriptionsToRun(
  sendTime: string,
): Promise<GetSubscriptions> {
  try {
    const subscriptionsToRun = await db
      .select()
      .from(printerBroadcastSubscriptions)
      .where(
        and(
          eq(printerBroadcastSubscriptions.sendTime, sendTime),
          eq(printerBroadcastSubscriptions.status, "active"),
        ),
      );

    if (subscriptionsToRun.length == 0) {
      return {
        success: true,
        message: "no jobs",
        subscriptions: [],
      };
    }

    return {
      success: true,
      message: "",
      subscriptions: subscriptionsToRun,
    };
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return {
      success: false,
      message: "Failed to fetch subscriptions",
      subscriptions: [],
    };
  }
}
