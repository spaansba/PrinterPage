"use server"
import { db } from ".."
import { printers, printerUserPairing, users } from "../schema"
import { and, eq, sql } from "drizzle-orm"
import type { Toaster, ToasterSubscriptions, WeatherSubOptions } from "@/app/types/printer"
import { subscribe } from "diagnostics_channel"
import { printerSubscriptions, printerWeatherSubscriptionOptions } from "../schema/subscriptions"

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

export const getToaster = async (printerId: string): Toaster => {
  try {
    const toaster = await db
      .select({
        id: printers.id,
        name: printers.name,
        profilePicture: printers.profilePicture,
        toastsReceived: printers.toastsReceived,
      })
      .from(printers)
      .where(eq(printers.id, printerId))

    const toasterSubs = await db.select({
      subscriptions: {},
    })
    if (toaster.length === 0) {
      return {
        success: false,
        message: "Toaster not found",
      }
    }

    return {
      success: true,
      message: "Toaster found successfully",
      data: toaster[0],
    }
  } catch (error) {
    console.error("Error fetching toaster:", error)
    return {
      success: false,
      message: "Error fetching toaster",
    }
  }
}

/**
 * Retrieves all printers (toasters) that have user pairings, including their basic information and paired user accounts.
 * Each printer can have multiple users paired to it.
 *
 * First gets all printer data (id, name, profile picture) from the printers table.
 * Then for each printer, queries the users table to get information about all paired users.
 *
 * @param userId - The ID of the user to get paired printers for
 * @returns An array of Toaster objects, each containing the printer info and an array of paired user accounts
 */
export const getPairedToasters = async (userId: string): Promise<Toaster[]> => {
  const printerResults = (await db
    .select({
      id: printers.id,
      name: printers.name,
      profilePicture: printers.profilePicture,
      toastsReceived: printers.toastsReceived,
      subscriptions: sql<ToasterSubscriptions>`json_build_object(
        'Weather', json_build_object(
          'active', ${printerSubscriptions.active},
          'sendTime', ${printerSubscriptions.sendTime},
          'location', ${printerWeatherSubscriptionOptions.location},
          'tempUnit', ${printerWeatherSubscriptionOptions.tempUnit}
        )
      )`,
    })
    .from(printerUserPairing)
    .innerJoin(printers, eq(printerUserPairing.printerId, printers.id))
    .leftJoin(
      printerSubscriptions,
      and(eq(printers.id, printerSubscriptions.printerId), eq(printerSubscriptions.type, "weather"))
    )
    .leftJoin(
      printerWeatherSubscriptionOptions,
      eq(printerSubscriptions.id, printerWeatherSubscriptionOptions.subscriptionId)
    )
    .where(eq(printerUserPairing.userId, userId))) as {
    id: string
    name: string
    profilePicture: string | null
    toastsReceived: number
    subscriptions: ToasterSubscriptions
  }[]

  const toasters = await Promise.all(
    printerResults.map(async (printer) => {
      const pairedUsers = await db
        .select({
          id: users.id,
          username: users.username,
          toastsSend: users.toastsSend,
        })
        .from(users)
        .innerJoin(printerUserPairing, eq(users.id, printerUserPairing.userId))
        .where(eq(printerUserPairing.printerId, printer.id))

      return {
        id: printer.id,
        name: printer.name,
        profilePicture: printer.profilePicture,
        toastsReceived: printer.toastsReceived,
        subscriptions: printer.subscriptions,
        pairedAccounts: pairedUsers,
      } satisfies Toaster
    })
  )

  return toasters
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
