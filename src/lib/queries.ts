"use server"
import { db } from "./index"
import {
  InsertUsersAssociatedPrinters,
  users,
  usersAssociatedPrinters,
  type newUserAssociatedPrinter,
} from "./schema"
import { eq, and, desc } from "drizzle-orm"

export const createNewUser = async (clerkUserId: string, clerkName: string) => {
  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, clerkUserId)).limit(1)

    if (existingUser.length > 0) {
      throw new Error("User already exists")
    }

    // Insert new user
    const newUser = await db
      .insert(users)
      .values({
        id: clerkUserId,
        userName: clerkName,
        messagesSend: 0,
        // createdAt and updatedAt will be handled by default values
      })
      .returning()

    return {
      success: true,
      user: newUser[0],
    }
  } catch (error) {
    console.error("Error creating new user:", error)
    throw error
  }
}

export const getAssociatedPrintersById = async (userId: string) => {
  return await db
    .select()
    .from(usersAssociatedPrinters)
    .where(eq(usersAssociatedPrinters.userId, userId))
    .orderBy(desc(usersAssociatedPrinters.lastSendMessage)) // Make sure the person you send the latest message to is on top of the recipients list
}

export const updateLastSendMessage = async (userId: string, printerId: string) => {
  const exists = await checkIfPrinterIsAssociated(userId, printerId)
  if (!exists) {
    return
  }
  await db
    .update(usersAssociatedPrinters)
    .set({ lastSendMessage: new Date().toISOString() })
    .where(
      and(
        eq(usersAssociatedPrinters.userId, userId),
        eq(usersAssociatedPrinters.printerId, printerId)
      )
    )
    .returning()
}

export const changeNameAssociatedPrinters = async (
  userId: string,
  printerId: string,
  newName: string
) => {
  try {
    const exists = await checkIfPrinterIsAssociated(userId, printerId)
    if (!exists) {
      return {
        success: false,
        data: null,
        error: {
          message: "Printer not found",
        },
      }
    }

    const result = await db
      .update(usersAssociatedPrinters)
      .set({ name: newName.trim() })
      .where(
        and(
          eq(usersAssociatedPrinters.userId, userId),
          eq(usersAssociatedPrinters.printerId, printerId)
        )
      )
      .returning()

    return {
      success: true,
      data: {
        userId: result[0].userId,
        printerId: result[0].printerId,
        name: result[0].name,
        lastSendMessage: result[0].lastSendMessage,
      },
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
    }
  }
}

export const addAssociatedPrinters = async (userId: string, printerId: string, name: string) => {
  const isAdded = await checkIfPrinterIsAssociated(userId, printerId)
  if (isAdded) {
    return {
      success: false,
      data: null,
      error: {
        message: "Printer ID already added",
      },
    }
  }
  try {
    const newAssociation: newUserAssociatedPrinter = {
      userId: userId,
      printerId: printerId,
      name: name,
      lastSendMessage: new Date().toISOString(),
    }
    const validateInsert = InsertUsersAssociatedPrinters.parse(newAssociation)

    const result = await db.insert(usersAssociatedPrinters).values(validateInsert).returning()

    return {
      success: true,
      data: {
        userId: result[0].userId,
        printerId: result[0].printerId,
        name: result[0].name,
        lastSendMessage: result[0].lastSendMessage,
      },
      error: null,
    }
  } catch (error) {
    // Check for foreign key violation error
    if (error instanceof Error && error.message.includes("violates foreign key constraint")) {
      return {
        success: false,
        data: null,
        error: {
          message: "Printer ID doesnt Exist.",
        },
      }
    }

    // Handle other errors
    return {
      success: false,
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
    }
  }
}

const checkIfPrinterIsAssociated = async (userId: string, printerId: string): Promise<boolean> => {
  const results = await db
    .select()
    .from(usersAssociatedPrinters)
    .where(
      and(
        eq(usersAssociatedPrinters.userId, userId),
        eq(usersAssociatedPrinters.printerId, printerId)
      )
    )
  return results.length > 0
}
