"use server";
import { db } from "./index";
import {
  InsertUsersAssociatedPrinters,
  printers,
  users,
  usersAssociatedPrinters,
  type newUserAssociatedPrinter,
} from "./schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const updatedUserName = async (userId: string, newUsername: string) => {
  return await db
    .update(users)
    .set({ username: newUsername })
    .where(eq(users.id, userId))
    .returning();
};

export const getAssociatedPrintersById = async (userId: string) => {
  return await db
    .select({
      printerId: usersAssociatedPrinters.associatedPrinterId,
      name: usersAssociatedPrinters.name,
      lastSendMessage: usersAssociatedPrinters.lastSendMessage,
      profilePicture: printers.profilePicture,
    })
    .from(usersAssociatedPrinters)
    .leftJoin(
      printers,
      eq(usersAssociatedPrinters.associatedPrinterId, printers.id),
    )
    .where(eq(usersAssociatedPrinters.userId, userId))
    .orderBy(desc(usersAssociatedPrinters.lastSendMessage));
};

export const incrementPrinterMessageStats = async (
  userId: string,
  associatedPrinterId: string,
) => {
  const exists = await checkIfPrinterIsAssociated(userId, associatedPrinterId);
  if (!exists) {
    return;
  }

  // Global message counter
  await db
    .update(users)
    .set({ toastsSend: sql`${users.toastsSend} + 1` })
    .where(eq(users.id, userId));

  // Printer specific message received counter
  await db
    .update(printers)
    .set({ toastsReceived: sql`${printers.toastsReceived} + 1` })
    .where(eq(printers.id, associatedPrinterId));

  // Message counter per associated printer ID
  await db
    .update(usersAssociatedPrinters)
    .set({
      lastSendMessage: new Date().toISOString(),
      toastsSendToAssociatedPrinter: sql`${usersAssociatedPrinters.toastsSendToAssociatedPrinter} + 1`,
    })
    .where(
      and(
        eq(usersAssociatedPrinters.userId, userId),
        eq(usersAssociatedPrinters.associatedPrinterId, associatedPrinterId),
      ),
    );
};

export const changeNameAssociatedPrinters = async (
  userId: string,
  printerId: string,
  newName: string,
) => {
  try {
    const exists = await checkIfPrinterIsAssociated(userId, printerId);
    if (!exists) {
      return {
        successs: false,
        data: null,
        error: {
          message: "Printer not found",
        },
      };
    }

    const result = await db
      .update(usersAssociatedPrinters)
      .set({ name: newName.trim(), updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(usersAssociatedPrinters.userId, userId),
          eq(usersAssociatedPrinters.associatedPrinterId, printerId),
        ),
      )
      .returning();

    return {
      successs: true,
      data: {
        userId: result[0].userId,
        printerId: result[0].associatedPrinterId,
        name: result[0].name,
        lastSendMessage: result[0].lastSendMessage,
      },
      error: null,
    };
  } catch (error) {
    return {
      successs: false,
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    };
  }
};

export const addAssociatedPrinters = async (
  userId: string,
  printerId: string,
  name: string,
) => {
  const isAdded = await checkIfPrinterIsAssociated(userId, printerId);
  if (isAdded) {
    return {
      successs: false,
      data: null,
      error: {
        message: "Printer ID already added",
      },
    };
  }
  try {
    const newAssociation: newUserAssociatedPrinter = {
      userId: userId,
      associatedPrinterId: printerId,
      name: name,
      lastSendMessage: new Date().toISOString(),
    };
    const validateInsert = InsertUsersAssociatedPrinters.parse(newAssociation);

    const result = await db
      .insert(usersAssociatedPrinters)
      .values(validateInsert)
      .returning();

    return {
      successs: true,
      data: {
        userId: result[0].userId,
        printerId: result[0].associatedPrinterId,
        name: result[0].name,
        lastSendMessage: result[0].lastSendMessage,
      },
      error: null,
    };
  } catch (error) {
    // Check for foreign key violation error
    if (
      error instanceof Error &&
      error.message.includes("violates foreign key constraint")
    ) {
      return {
        successs: false,
        data: null,
        error: {
          message: "Printer ID doesnt Exist.",
        },
      };
    }

    // Handle other errors
    return {
      successs: false,
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    };
  }
};

export const removeAssociatedPrinters = async (
  userId: string,
  printerId: string,
) => {
  const isAdded = await checkIfPrinterIsAssociated(userId, printerId);
  if (!isAdded) {
    return {
      successs: false,
      data: null,
      error: {
        message: "Printer ID doesnt exist as associated printer ID",
      },
    };
  }
  try {
    await db
      .delete(usersAssociatedPrinters)
      .where(
        and(
          eq(usersAssociatedPrinters.userId, userId),
          eq(usersAssociatedPrinters.associatedPrinterId, printerId),
        ),
      );
  } catch {
    return {
      successs: false,
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    };
  } finally {
    return {
      success: true,
      data: null,
    };
  }
};

export const checkIfPrinterExists = async (printerId: string) => {
  const result = await db.query.printers.findFirst({
    where: eq(printers.id, printerId),
  });
  return result !== undefined;
};

const checkIfPrinterIsAssociated = async (
  userId: string,
  printerId: string,
): Promise<boolean> => {
  const results = await db
    .select()
    .from(usersAssociatedPrinters)
    .where(
      and(
        eq(usersAssociatedPrinters.userId, userId),
        eq(usersAssociatedPrinters.associatedPrinterId, printerId),
      ),
    );
  return results.length > 0;
};
