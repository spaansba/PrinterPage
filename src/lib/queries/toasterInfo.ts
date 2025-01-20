"use server"
import type { SettingDefinition, Toaster } from "@/app/types/printer"
import { db } from ".."
import { printers, printerUserPairing, users } from "../schema"
import { and, eq, type SQL } from "drizzle-orm"
import {
  printerBroadcasters,
  printerBroadcastSubscriptions,
  type SubscriptionStatus,
} from "../schema/subscriptions"

type UpdateToasterData = {
  name?: string
  profilePicture?: string
}

export const updateToasterInformation = async (toasterId: string, data: UpdateToasterData) => {
  try {
    // Only include fields that are provided in the update
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    }

    const updatedToaster = await db
      .update(printers)
      .set(updateData)
      .where(eq(printers.id, toasterId))
      .returning()

    if (!updatedToaster.length) {
      return {
        success: false,
        message: "Toaster not found",
        data: null,
      }
    }

    return {
      success: true,
      message: "Toaster updated successfully",
      data: updatedToaster[0],
    }
  } catch (error) {
    console.error("Error updating toaster:", error)
    return {
      success: false,
      message: "Failed to update toaster",
      data: null,
    }
  }
}

const fetchToasters = async (where: SQL<unknown>): Promise<Toaster[]> => {
  const results = await db
    .select({
      id: printers.id,
      name: printers.name,
      profilePicture: printers.profilePicture,
      toastsReceived: printers.toastsReceived,
      subscriptions: {
        id: printerBroadcastSubscriptions.id,
        settings: printerBroadcasters.settings,
        title: printerBroadcasters.name,
        description: printerBroadcasters.description,
        settingsValues: printerBroadcastSubscriptions.settingsValues,
        sendTime: printerBroadcastSubscriptions.sendTime,
        status: printerBroadcastSubscriptions.status,
      },
      pairedUser: {
        id: users.id,
        username: users.username,
        toastsSend: users.toastsSend,
      },
    })
    .from(printers)
    .leftJoin(
      printerBroadcastSubscriptions,
      eq(printers.id, printerBroadcastSubscriptions.printerId)
    )
    .leftJoin(
      printerBroadcasters,
      eq(printerBroadcastSubscriptions.broadcastId, printerBroadcasters.id)
    )
    .leftJoin(printerUserPairing, eq(printers.id, printerUserPairing.printerId))
    .leftJoin(users, eq(printerUserPairing.userId, users.id))
    .where(where)

  // Group results by printer and transform into Toaster type
  const toasterMap = new Map<string, Toaster>()

  results.forEach((row) => {
    if (!toasterMap.has(row.id)) {
      // Initialize base toaster without subscriptions or paired accounts
      const toaster: Toaster = {
        id: row.id,
        name: row.name,
        profilePicture: row.profilePicture,
        toastsReceived: row.toastsReceived,
        subscriptions: [],
        pairedAccounts: row.pairedUser ? [row.pairedUser] : [],
      }

      // If this row has a subscription, add it
      if (row.subscriptions.id) {
        const settingDefinitions = row.subscriptions.settings as Record<string, SettingDefinition>
        const userValues = row.subscriptions.settingsValues as Record<string, string>

        const mergedSettings: Record<string, SettingDefinition> = {}

        // Merge setting definitions with user values
        Object.entries(settingDefinitions).forEach(([key, definition]) => {
          const userValue = userValues[key] || null
          mergedSettings[key] = {
            ...definition,
            userValue,
          }
        })

        toaster.subscriptions = [
          {
            subId: row.subscriptions.id,
            settings: mergedSettings,
            sendTime: row.subscriptions.sendTime,
            status: row.subscriptions.status as SubscriptionStatus,
            description: row.subscriptions.description!,
            title: row.subscriptions.title!,
          },
        ]
      }

      toasterMap.set(row.id, toaster)
    } else {
      const toaster = toasterMap.get(row.id)!

      // Add subscription if it exists and isn't already added
      if (
        row.subscriptions.id &&
        !toaster.subscriptions.some((s) => s.settings === row.subscriptions.settings)
      ) {
        const settingDefinitions = row.subscriptions.settings as Record<string, SettingDefinition>
        const userValues = row.subscriptions.settingsValues as Record<string, { value: string }>

        const mergedSettings: Record<string, SettingDefinition> = {}

        // Merge setting definitions with user values
        Object.entries(settingDefinitions).forEach(([key, definition]) => {
          const userValue = userValues[key]?.value || null
          mergedSettings[key] = {
            ...definition,
            userValue,
          }
        })

        toaster.subscriptions.push({
          subId: row.subscriptions.id,
          settings: mergedSettings,
          sendTime: row.subscriptions.sendTime,
          status: row.subscriptions.status as SubscriptionStatus,
          description: row.subscriptions.description!,
          title: row.subscriptions.title!,
        })
      }

      // Add paired user if it exists and isn't already added
      if (row.pairedUser && !toaster.pairedAccounts?.some((u) => u.id === row.pairedUser?.id)) {
        toaster.pairedAccounts!.push(row.pairedUser)
      }
    }
  })

  return Array.from(toasterMap.values())
}

export const getToaster = async (
  printerId: string
): Promise<{
  success: boolean
  message: string
  data: Toaster | null
}> => {
  try {
    const toasters: Toaster[] = await fetchToasters(eq(printers.id, printerId))

    if (toasters.length === 0) {
      return {
        success: false,
        message: "Toaster not found",
        data: null,
      }
    }

    return {
      success: true,
      message: "Toaster found successfully",
      data: toasters[0],
    }
  } catch (error) {
    console.error("Error fetching toaster:", error)
    return {
      success: false,
      message: "Error fetching toaster",
      data: null,
    }
  }
}

export const getPairedToasters = async (
  userId: string
): Promise<{
  success: boolean
  message: string
  data: Toaster[]
}> => {
  try {
    const toasters = await fetchToasters(eq(printerUserPairing.userId, userId))

    if (toasters.length === 0) {
      return {
        success: false,
        message: "No paired toasters found",
        data: [],
      }
    }

    return {
      success: true,
      message: "Paired toasters found successfully",
      data: toasters,
    }
  } catch (error) {
    console.error("Error fetching paired toasters:", error)
    return {
      success: false,
      message: "Error fetching paired toasters",
      data: [],
    }
  }
}
export const checkIfAlreadyPaired = async (printerId: string, userId: string) => {
  return await db
    .select()
    .from(printerUserPairing)
    .where(and(eq(printerUserPairing.printerId, printerId), eq(printerUserPairing.userId, userId)))
    .limit(1)
}

export const deleteToasterPairing = async (printerId: string, userId: string) => {
  try {
    const result = await db
      .delete(printerUserPairing)
      .where(
        and(eq(printerUserPairing.printerId, printerId), eq(printerUserPairing.userId, userId))
      )
      .returning()

    if (result.length === 0) {
      return {
        success: false,
        message: "Paired printer not found",
      }
    }
    return {
      success: true,
      message: "",
    }
  } catch (error) {
    return {
      success: false,
      message: "Error in deleting printer pairing",
    }
  }
}
