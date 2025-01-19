"use server"
import type { Toaster } from "@/app/types/printer"
import { db } from ".."
import { printers, printerUserPairing, users } from "../schema"
import { and, eq, sql } from "drizzle-orm"
import { printerBroadcastSubscriptions, type PrinterSubscription } from "../schema/subscriptions"

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

export const getToaster = async (
  printerId: string
): Promise<{
  success: boolean
  message: string
  data?: Toaster
}> => {
  try {
    const results = await db
      .select({
        id: printers.id,
        name: printers.name,
        profilePicture: printers.profilePicture,
        toastsReceived: printers.toastsReceived,
        subscriptions: printerBroadcastSubscriptions,
      })
      .from(printers)
      .leftJoin(
        printerBroadcastSubscriptions,
        eq(printers.id, printerBroadcastSubscriptions.printerId)
      )
      .where(eq(printers.id, printerId))

    if (results.length === 0) {
      return {
        success: false,
        message: "Toaster not found",
      }
    }

    // Transform the flattened results into the Toaster type
    const toaster: Toaster = {
      id: results[0].id,
      name: results[0].name,
      profilePicture: results[0].profilePicture,
      toastsReceived: results[0].toastsReceived,
      subscriptions: results
        .filter(
          (
            row
          ): row is (typeof results)[0] & {
            subscriptions: NonNullable<(typeof results)[0]["subscriptions"]>
          } => row.subscriptions !== null
        )
        .map((row) => row.subscriptions),
    }

    return {
      success: true,
      message: "Toaster found successfully",
      data: toaster,
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
 * @param userId - The ID of the user to get paired printers for
 * @returns An array of Toaster objects, each containing the printer info and an array of paired user accounts
 */
export const getPairedToasters = async (
  userId: string
): Promise<{
  success: boolean
  message: string
  data: Toaster[]
}> => {
  try {
    const results = await db
      .select({
        id: printers.id,
        name: printers.name,
        profilePicture: printers.profilePicture,
        toastsReceived: printers.toastsReceived,
        subscriptions: printerBroadcastSubscriptions,
        pairedUser: {
          id: users.id,
          username: users.username,
          toastsSend: users.toastsSend,
        },
      })
      .from(printerUserPairing)
      .innerJoin(printers, eq(printerUserPairing.printerId, printers.id))
      .leftJoin(
        printerBroadcastSubscriptions,
        eq(printers.id, printerBroadcastSubscriptions.printerId)
      )
      .leftJoin(users, eq(printerUserPairing.userId, users.id))
      .where(eq(printerUserPairing.userId, userId))

    if (results.length === 0) {
      return {
        success: false,
        message: "No paired toasters found",
        data: [],
      }
    }

    // Group results by printer and transform into Toaster type
    const toasterMap = new Map<string, Toaster>()

    results.forEach((row) => {
      if (!toasterMap.has(row.id)) {
        toasterMap.set(row.id, {
          id: row.id,
          name: row.name,
          profilePicture: row.profilePicture,
          toastsReceived: row.toastsReceived,
          subscriptions: [],
          pairedAccounts: [],
        })
      }

      const toaster = toasterMap.get(row.id)!

      // Add subscription if it exists and isn't already added
      if (row.subscriptions && !toaster.subscriptions.some((s) => s.id === row.subscriptions!.id)) {
        toaster.subscriptions.push(row.subscriptions)
      }

      // Add paired user if it exists and isn't already added
      if (row.pairedUser?.id && !toaster.pairedAccounts?.some((u) => u.id === row.pairedUser?.id)) {
        toaster.pairedAccounts!.push({
          id: row.pairedUser.id,
          username: row.pairedUser.username,
          toastsSend: row.pairedUser.toastsSend,
        })
      }
    })

    return {
      success: true,
      message: "Paired toasters found successfully",
      data: Array.from(toasterMap.values()),
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
