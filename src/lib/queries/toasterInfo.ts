"use server"
import { db } from ".."
import { printers, printerUserPairing, users } from "../schema"
import { and, eq } from "drizzle-orm"
import type { Toaster } from "@/app/types/printer"

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

// export const getUsersPairedToTaster = async (printerId: string) => {
//   const userIds = await db
//     .select({ id: printerUserPairing.userId })
//     .from(printerUserPairing)
//     .where(eq(printerUserPairing.printerId, printerId))

//   if (userIds.length === 0) {
//     return {
//       success: false,
//       message: "no paired users found",
//       data: [],
//     }
//   }

//   const userIdStrings = userIds.map((user) => user.id)
//   const userInfo = await getUserInformation(userIdStrings)

//   return {
//     success: true,
//     message: "",
//     data: userInfo,
//   }
// }

export const getToaster = async (printerId: string) => {
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

// export const getToasterInformation = async (printerIds: string[]) => {
//   const pairedToasterInfo = await db
//     .select({
//       id: printers.id,
//       name: printers.name,
//       profilePicture: printers.profilePicture,
//     })
//     .from(printers)
//     .where(inArray(printers.id, printerIds))
//   return pairedToasterInfo
// }

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
  const printerResults = await db
    .select({
      id: printers.id,
      name: printers.name,
      profilePicture: printers.profilePicture,
      toastsReceived: printers.toastsReceived,
    })
    .from(printerUserPairing)
    .innerJoin(printers, eq(printerUserPairing.printerId, printers.id))
    .where(eq(printerUserPairing.userId, userId))

  // For each printer, get its paired users from the users table
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
        pairedAccounts: pairedUsers,
      }
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
