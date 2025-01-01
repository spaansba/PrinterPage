"use server"
import { db } from ".."
import { printers, printerUserPairing } from "../schema"
import { and, eq, inArray } from "drizzle-orm"
import { getUserInformation } from "./userInfo"

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

export const getUsersPairedToTaster = async (printerId: string) => {
  const userIds = await db
    .select({ id: printerUserPairing.userId })
    .from(printerUserPairing)
    .where(eq(printerUserPairing.printerId, printerId))

  if (userIds.length === 0) {
    return {
      success: false,
      message: "no paired users found",
      data: [],
    }
  }

  const userIdStrings = userIds.map((user) => user.id)
  const userInfo = await getUserInformation(userIdStrings)

  return {
    success: true,
    message: "",
    data: userInfo,
  }
}

export const getToaster = async (printerId: string) => {
  try {
    const toaster = await db
      .select({
        id: printers.id,
        name: printers.name,
        profilePicture: printers.profilePicture,
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

export const getToasterInformation = async (printerIds: string[]) => {
  const pairedToasterInfo = await db
    .select({
      id: printers.id,
      name: printers.name,
      profilePicture: printers.profilePicture,
    })
    .from(printers)
    .where(inArray(printers.id, printerIds))

  return pairedToasterInfo
}

export const getPairedToasters = async (userId: string) => {
  const pairedToasters = await db
    .select()
    .from(printerUserPairing)
    .where(eq(printerUserPairing.userId, userId))
  return pairedToasters.map((toaster) => toaster.printerId)
}

export const checkIfAlreadyPaired = async (printerId: string, userId: string) => {
  return await db
    .select()
    .from(printerUserPairing)
    .where(and(eq(printerUserPairing.printerId, printerId), eq(printerUserPairing.userId, userId)))
    .limit(1)
}
