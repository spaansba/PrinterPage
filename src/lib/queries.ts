"use server"
import { db } from "./index"
import {
  InsertUsersAssociatedPrinters,
  posts,
  usersAssociatedPrinters,
  type NewPost,
  type newUserAssociatedPrinter,
} from "./schema"
import { eq, and } from "drizzle-orm"

export const getPosts = async () => {
  const selectResult = await db.select().from(posts)
  console.log("Results", selectResult)
  return selectResult
}

export const insertPost = async (post: NewPost) => {
  return db.insert(posts).values(post).returning()
}

export const getAssociatedPrintersById = async (userID: string) => {
  return await db
    .select()
    .from(usersAssociatedPrinters)
    .where(eq(usersAssociatedPrinters.userId, userID))
}

export const addAssociatedPrinters = async (userID: string, printerId: string, name: string) => {
  const isAdded = await checkIfPrinterIsAlreadyAssociated(userID, printerId)
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
      userId: userID,
      printerId: printerId,
      name: name,
    }
    const validateInsert = InsertUsersAssociatedPrinters.parse(newAssociation)

    const result = await db.insert(usersAssociatedPrinters).values(validateInsert).returning()

    return {
      success: true,
      data: {
        userId: result[0].userId,
        printerId: result[0].printerId,
        name: result[0].name,
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

const checkIfPrinterIsAlreadyAssociated = async (
  userID: string,
  printerId: string
): Promise<boolean> => {
  const results = await db
    .select()
    .from(usersAssociatedPrinters)
    .where(
      and(
        eq(usersAssociatedPrinters.userId, userID),
        eq(usersAssociatedPrinters.printerId, printerId)
      )
    )
  return results.length > 0
}
