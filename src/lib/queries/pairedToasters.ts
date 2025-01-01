"use server"
import { db } from ".."
import { printers, printerUserPairing } from "../schema"
import { and, eq, inArray } from "drizzle-orm"
import { getUserInformation } from "./userInfo"

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
